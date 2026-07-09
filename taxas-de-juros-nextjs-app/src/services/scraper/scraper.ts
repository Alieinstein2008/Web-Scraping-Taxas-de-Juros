import playwright from 'playwright';
import { BASE_URL, MAX_PARALLEL_PAGES } from './constants';
import { SEARCH_TYPE_TOGGLE_SWITCH } from '@/src/constants';
import { splitArray } from './utils';
import { DataScraperError, DataScraperResult, ModalityInterestRates, ScraperTargetType, DataScraperType, FinancialInstitutionRate, ScraperBatchResult } from './types';
import { OPTIMIZATION_LAUNCH_ARGS, DEFAULT_TIMEOUTS } from './config';
import { customContext, customOptimizationPageRoute } from './browser';

type PeriodKeyMap = keyof typeof SEARCH_TYPE_TOGGLE_SWITCH;

type PeriodValueMap = (typeof SEARCH_TYPE_TOGGLE_SWITCH)[PeriodKeyMap];

type ColumnIndexes = {
    cnpjColumnIndex: number;
    financialInstitutionColumnIndex: number;
    ratePeriodTypeColumnIndex: number;
};

function areValidColumnIndexes(columnIndexes: ColumnIndexes): boolean {
    return Number.isInteger(columnIndexes.cnpjColumnIndex)
        && Number.isInteger(columnIndexes.financialInstitutionColumnIndex)
        && Number.isInteger(columnIndexes.ratePeriodTypeColumnIndex);
}

async function getTableData(page: playwright.Page, columnIndexes: ColumnIndexes): Promise<FinancialInstitutionRate[]> {
    if (!areValidColumnIndexes(columnIndexes)) {
        return [];
    }

    return await page.$$eval(
        'table tbody tr',
        (rows, { cnpjColumnIndex, financialInstitutionColumnIndex, ratePeriodTypeColumnIndex }) => {
            return rows.map(tr => {
                const institutionNameCell = tr.querySelector(`td:nth-child(${financialInstitutionColumnIndex})`);
                const institutionCnpjCell = tr.querySelector(`td:nth-child(${cnpjColumnIndex})`);
                const interestRateCell = tr.querySelector(`td:nth-child(${ratePeriodTypeColumnIndex})`);

                return {
                    institutionName: institutionNameCell?.textContent?.trim() ?? '',
                    institutionCnpj: institutionCnpjCell?.textContent?.trim() ?? '',
                    rawInterestRate: interestRateCell?.textContent?.trim() ?? ''
                };
            });
        },
        columnIndexes
    );
}

async function clickNextPage(page: playwright.Page): Promise<void> {
    await page.click('a:has-text("›")', { timeout: DEFAULT_TIMEOUTS.ELEMENT });
    await page.waitForSelector('table', { state: 'visible', timeout: DEFAULT_TIMEOUTS.TABLE });
}

async function scraperTarget(page: playwright.Page, target: string, selectedPeriod: PeriodValueMap): Promise<ScraperTargetType> {
    try {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    } catch (error) {
        return { success: false, error: { type: 'connectionError', errorTarget: target, errorDetails: error } };
    }

    try {
        const navLink = page.getByRole('link', { name: target, exact: true }).locator('visible=true').first();
        await page.locator('bcb-loading').waitFor({ state: 'hidden', timeout: DEFAULT_TIMEOUTS.LOADING });
        await navLink.waitFor({ state: 'attached', timeout: DEFAULT_TIMEOUTS.STATE });
        await navLink.click({ timeout: DEFAULT_TIMEOUTS.ELEMENT });
    } catch (error) {
        return { success: false, error: { type: 'internalTargetError', errorTarget: target, errorDetails: error } };
    }

    await page.waitForSelector('table thead', { timeout: DEFAULT_TIMEOUTS.TABLE });

    const [period, modality, tableHeaderCells, paginationCount] = await Promise.all([
        page.textContent('p:has-text("Período:") strong') ?? Promise.resolve(''),
        page.textContent('p:has-text("Modalidade:") strong') ?? Promise.resolve(target),
        page.$$eval('table thead tr:nth-child(2) th', cells => cells.map(c => c.textContent?.trim() ?? '')),
        page.locator('ul.pagination li > a').filter({ hasText: /[0-9]{1,}/ }).count()
    ]);

    const [
        financialInstitutionColumnIndex,
        cnpjColumnIndex,
        ratePeriodTypeColumnIndex
    ] = [
            (tableHeaderCells as string[]).findIndex(text => text?.trim() === 'Instituição Financeira') + 1,
            (tableHeaderCells as string[]).findIndex(text => text?.trim() === 'CNPJ') + 1,
            (tableHeaderCells as string[]).findIndex(text => text?.trim() === selectedPeriod) + 1
        ];

    if (ratePeriodTypeColumnIndex === 0 || financialInstitutionColumnIndex === 0 || cnpjColumnIndex === 0) {
        return { success: false, error: { type: 'columnError', errorTarget: target } };
    }

    let financialInstitutionRates: FinancialInstitutionRate[] = [];


    if (paginationCount > 0) {

        for (let currentPage = 0; currentPage < paginationCount; currentPage++) {

            const currentPageRates = await getTableData(page, { cnpjColumnIndex: cnpjColumnIndex, financialInstitutionColumnIndex: financialInstitutionColumnIndex, ratePeriodTypeColumnIndex: ratePeriodTypeColumnIndex });
            financialInstitutionRates.push(...currentPageRates);

            if (currentPage < paginationCount - 1) {
                await clickNextPage(page);
            }
        }
    } else {
        financialInstitutionRates = await getTableData(page, { cnpjColumnIndex: cnpjColumnIndex, financialInstitutionColumnIndex: financialInstitutionColumnIndex, ratePeriodTypeColumnIndex: ratePeriodTypeColumnIndex });
    }

    return {
        success: true,
        data: {
            modality: modality ?? '',
            validityPeriod: period ?? '',
            rates: financialInstitutionRates,
        }
    };
}

async function processTargetGroup(page: playwright.Page, targetGroup: string[], selectedPeriod: PeriodValueMap): Promise<ScraperBatchResult> {

    const batchResult: ScraperBatchResult = {
        success: [],
        errors: []
    };

    for (const target of targetGroup) {
        try {
            const targetResult = await scraperTarget(page, target, selectedPeriod);
            if (targetResult.success) {
                batchResult.success.push(targetResult.data);
            } else {
                batchResult.errors.push(targetResult.error);
            }
        } catch (error) {
            batchResult.errors.push({ type: 'externalTargetError', errorTarget: target, errorDetails: error });
        }
    }

    return batchResult;
}

export async function interestRateDataScraper({ searchTargets, selectedPeriod }: { searchTargets: string[], selectedPeriod: PeriodValueMap }): Promise<DataScraperType> {

    const scraperErrorResult: DataScraperError[] = [];
    const modalities: ModalityInterestRates[] = [];

    const numberPages = Math.min(MAX_PARALLEL_PAGES, Math.max(1, searchTargets.length));
    const targetGroup = splitArray(searchTargets, numberPages);

    let browser: playwright.Browser | undefined;
    let context: playwright.BrowserContext | undefined;
    let pageTestConnection: playwright.Page | undefined;
    let pages: playwright.Page[] = [];

    try {
        browser = await playwright.chromium.launch({ args: OPTIMIZATION_LAUNCH_ARGS, headless: true });
        context = await customContext(browser);

        try {
            pageTestConnection = await context!.newPage();
            pageTestConnection.setDefaultTimeout(DEFAULT_TIMEOUTS.CONNECTION);
            pageTestConnection.setDefaultNavigationTimeout(DEFAULT_TIMEOUTS.CONNECTION);
            await customOptimizationPageRoute(pageTestConnection);
            await pageTestConnection.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUTS.CONNECTION });
        } catch (error) {
            return {
                success: false,
                error: { type: 'connectionError' }
            };
        }
        finally {

        }

        pages = await Promise.all(
            Array.from({ length: numberPages }, async () => {
                const page = await context!.newPage();
                page.setDefaultTimeout(DEFAULT_TIMEOUTS.NAVIGATION);
                page.setDefaultNavigationTimeout(DEFAULT_TIMEOUTS.NAVIGATION);
                await customOptimizationPageRoute(page);
                return page;
            })
        );

        const batchResults = await Promise.all(pages.map((page, index) => processTargetGroup(page, targetGroup[index], selectedPeriod)));

        for (const batchResult of batchResults) {
            if (batchResult.success) modalities.push(...batchResult.success);
            if (batchResult.errors) scraperErrorResult.push(...batchResult.errors);
        }

        return {
            success: true,
            result: {
                passed: {
                    interestRatePeriod: selectedPeriod,
                    modalities: modalities
                },
                failed: scraperErrorResult
            }
        };

    } catch (error: unknown) {
        if (error instanceof Error) {
            return {
                success: false,
                error: { type: 'internalScraperError', errorDetails: error.message }
            };
        } else {
            return {
                success: false,
                error: { type: 'unexpectedScraperError', errorDetails: error }
            };
        }

    } finally {
        await Promise.all(pages.map(page => page.close().catch(() => undefined)));
        if (pageTestConnection) {
            await pageTestConnection.close().catch(() => undefined);
        }
        if (context) {
            await context.close().catch(() => undefined);
        }
        if (browser) {
            await browser.close().catch(() => undefined);
        }

    }
}