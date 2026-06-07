import playwright from 'playwright';
import { customOptimizationBrowserArgsLaunch, customContext, customOptimizationPageRoute } from "@/src/services/scraper/config/customDefinitions.config";
import { DataScraperType, DataScraperError } from "@/src/types/data-scraper.types";
import { TIMEOUTS } from './constants';
import { SEARCH_TYPE_TOGGLE_SWITCH } from '@/src/constants';

type PeriodKeyMap = keyof typeof SEARCH_TYPE_TOGGLE_SWITCH;

type PeriodValueMap = (typeof SEARCH_TYPE_TOGGLE_SWITCH)[PeriodKeyMap];

async function scraperTarget(page: playwright.Page, target: string, selectedPeriod: PeriodValueMap, isFirstTarget: boolean): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
        if (isFirstTarget) {
            await page.goto('https://www.bcb.gov.br/estatisticas/txjuros', { waitUntil: 'domcontentloaded' });
        } else {
            await page.click('bcb-breadcrumb nav ol li:nth-child(3)', { timeout: TIMEOUTS.ELEMENT });
        }
        await page.waitForSelector('bcb-loading', { state: 'hidden', timeout: TIMEOUTS.LOADING });

        try {
            await page.click(`li > a:has-text("${target}")`, { timeout: TIMEOUTS.ELEMENT });
        } catch {
            return { success: false, error: { type: 'targetError', errorTarget: target } };
        }

        await page.waitForSelector('table thead', { timeout: TIMEOUTS.TABLE });

        const [period, modality, tableHeaderCells, paginationCount] = await Promise.all([
            page.textContent('p:has-text("Período:") strong') ?? Promise.resolve(''),
            page.textContent('p:has-text("Modalidade:") strong') ?? Promise.resolve(target),
            page.$$eval('table thead tr:nth-child(2) th', cells => cells.map(c => c.textContent?.trim() ?? '')),
            page.locator('ul.pagination li > a').filter({ hasText: /[0-9]{1,}/ }).count()
        ]);

        const selectedColumnIndex = (tableHeaderCells as string[]).findIndex(text => text?.trim() === selectedPeriod) + 1;

        if (selectedColumnIndex === 0) {
            return { success: false, error: { type: 'columnNotFound', errorTarget: target } };
        }

        let interestRates: number[] = [];

        if (paginationCount > 0) {
            for (let currentPage = 0; currentPage < paginationCount; currentPage++) {
                const rates = await page.$$eval(
                    `table tbody tr td:nth-child(${selectedColumnIndex})`,
                    (cells) => cells.map(cell => +(cell.textContent?.replace(',', '.') ?? '0'))
                );
                interestRates.push(...rates);

                if (currentPage < paginationCount - 1) {
                    await page.click('a:has-text("›")', { timeout: TIMEOUTS.ELEMENT });
                    await page.waitForSelector('table', { state: 'visible', timeout: TIMEOUTS.TABLE });
                }
            }
        } else {
            interestRates = await page.$$eval(
                `table tbody tr td:nth-child(${selectedColumnIndex})`,
                (cells) => cells.map(cell => +(cell.textContent?.replace(',', '.') ?? '0'))
            );
        }

        const averageInterestRate = interestRates.length > 0
            ? interestRates.reduce((sum, rate) => sum + rate, 0) / interestRates.length
            : 0;

        const datesPeriod = period?.split(' a ').map((date) => {
            const [day, month, year] = date.split('/')
            return `${year}-${month}-${day}`;
        });

        return {
            success: true,
            data: {
                datesPeriod: datesPeriod,
                modality: modality,
                averageInterestRate: averageInterestRate.toFixed(2),
            }
        };

    } catch (error) {
        return { success: false, error: { type: 'scraperError', errorTarget: target, details: error } };
    }
}

export async function interestRateDataScraper({ searchTargets, selectedPeriod }: { searchTargets: string[], selectedPeriod: PeriodValueMap }): Promise<DataScraperType> {
    console.time('tempo-execucao-total');

    const scraperErrorResult: DataScraperError[] = [];
    const modalities: string[] = [];
    const periods: string[] = [];
    const averageInterestRates: string[] = [];

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch, headless: true });

    try {
        const context = await customContext(browser);
        const page = await context.newPage();

        page.setDefaultTimeout(TIMEOUTS.NAVIGATION);
        page.setDefaultNavigationTimeout(TIMEOUTS.NAVIGATION);
        await customOptimizationPageRoute(page);

        await page.goto('https://www.bcb.gov.br/estatisticas/txjuros', { waitUntil: 'domcontentloaded' });

        for (let indexTarget = 0; indexTarget < searchTargets.length; indexTarget++) {
            const result = await scraperTarget(page, searchTargets[indexTarget], selectedPeriod, indexTarget === 0);
            if (result.success && result.data) {
                modalities.push(result.data.modality);
                periods.push(...result.data.datesPeriod);
                averageInterestRates.push(result.data.averageInterestRate);
            } else {
                scraperErrorResult.push(result.error as DataScraperError);
            }
        }

        await browser.close();

    } catch (error) {
        await browser.close();
        return {
            sucess: false,
            error: { type: 'connectionError' }
        };
    }


    periods.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let [olderDate, recentDate] = [periods[0].split('-'), periods[periods.length - 1].split('-')];

    const period = `${olderDate[2]}/${olderDate[1]} - ${recentDate[2]}/${recentDate[1]}`;

    console.timeEnd('tempo-execucao-total');

    return {
        sucess: true,
        result: {
            passed: {
                period: period,
                modalities: modalities,
                averageInterestRates: averageInterestRates,
                interestRatePeriod: selectedPeriod
            },
            failed: scraperErrorResult
        }
    };
}