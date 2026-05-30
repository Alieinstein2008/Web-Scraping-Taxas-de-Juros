import playwright from 'playwright';
import { customOptimizationBrowserArgsLaunch, customContext, customOptimizationPageRoute } from './config/customDefinitions.config';
import { DataScraperType, DataScraperSucess, DataScraperError } from './types/dataScraper-types';
import { searchTarget } from './constants';

const interestRatesPeriod = {
    'Anual': '% a.a.',
    'Mensal': '% a.m.'
};

type PeriodKeyMap = keyof typeof interestRatesPeriod;

export async function interestRateDataScraper({ searchTargets, selectedPeriod }: { searchTargets: string[], selectedPeriod: PeriodKeyMap }): Promise<DataScraperType> {

    const scraperSucessResult: DataScraperSucess[] = [];
    const scraperErrorResult: DataScraperError[] = [];

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch });
    const context = await customContext(browser);
    const page = await context.newPage();
    await customOptimizationPageRoute(page);

    let counter = 1;

    for (const target of searchTargets) {

        try {

            counter === 1 ? await page.goto('https://www.bcb.gov.br/estatisticas/txjuros') : await page.locator('bcb-breadcrumb nav ol li:nth-child(3)').click();

            await page.waitForSelector('bcb-loading', { state: 'hidden' });

            try {

                await page.getByRole("link", { name: target }).first().click();

            } catch (error) {

                scraperErrorResult[scraperErrorResult.length] = { type: 'targetError', errorTarget: target };
                break;
            }

            const period: string = await page.getByRole("paragraph").filter({ hasText: "Período: " }).locator("> strong").textContent() ?? '';
            const modality: string = await page.getByRole("paragraph").filter({ hasText: "Modalidade: " }).locator("> strong").textContent() ?? target;

            const tableHeaderCells = await page.$$eval('table thead tr:nth-child(2) th', headerCells => headerCells.map(headerCell => headerCell.textContent));
            const selectedColumnIndex = tableHeaderCells.findIndex(text => text.trim() === interestRatesPeriod[selectedPeriod]) + 1;
            const interestRates: number[] = await page.$$eval(`table tbody tr td:nth-child(${selectedColumnIndex})`, tableCells => tableCells.map(cells => +((cells.textContent ?? '').replace(',', '.'))));
            const paginationItems: number = await page.locator('ul.pagination li > a', { hasText: /[0-9]{1,}/ }).count();

            if (paginationItems > 0) {
                for (let currentPage = 1; currentPage < paginationItems; currentPage++) {
                    await page.getByRole('link', { name: "›" }).first().click();
                    await page.waitForSelector('table', { state: 'visible' });
                    interestRates.push(...(await page.$$eval(`table tbody tr td:nth-child(${selectedColumnIndex})`, tableCells => tableCells.map(cells => +((cells.textContent ?? '').replace(',', '.'))))));
                }
            }

            const averageInterestRate = interestRates.reduce((sum, rate) => sum + rate, 0) / interestRates.length;

            const structureResultObject: DataScraperSucess = {
                consultPeriod: period,
                modality: modality,
                averageInterestRate: averageInterestRate.toFixed(2),
                interestRatePeriod: interestRatesPeriod[selectedPeriod],
            };

            scraperSucessResult[scraperSucessResult.length] = structureResultObject;

        } catch (error) {
            await browser.close();
            return {
                sucess: false,
                error: { type: 'connectionError' }
            }
        }
        counter++;
    }

    await browser.close();

    return {
        sucess: true,
        result: {
            sucess: scraperSucessResult,
            error: scraperErrorResult
        }
    }
}