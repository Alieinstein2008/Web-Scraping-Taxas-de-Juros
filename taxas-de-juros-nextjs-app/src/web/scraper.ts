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

    console.time('tempo')
    const scraperSucessResult: DataScraperSucess[] = [];
    const scraperErrorResult: DataScraperError[] = [];

    const browser = await playwright.chromium.launch({ args: customOptimizationBrowserArgsLaunch })
    const context = await customContext(browser);
    const page = await context.newPage();
    await customOptimizationPageRoute(page);

    for (const target of searchTargets) {

        try {

            await page.goto('https://www.bcb.gov.br/estatisticas/txjuros');
            await page.waitForSelector('bcb-loading', { state: 'hidden' });

            try {

                await page.getByRole("link", { name: target }).first().click();

            } catch (error) {

                scraperErrorResult.push({ type: 'targetError', errorTarget: target });
                break;
            }

            const regexYear = /\/[0-9][0-9][0-9][0-9]/g
            const period = (await page.getByRole("paragraph").filter({ hasText: "Período: " }).locator("> strong").textContent())?.replaceAll(regexYear, "");
            const modality: string = await page.getByRole("paragraph").filter({ hasText: "Modalidade: " }).locator("> strong").textContent() ?? target;

            await page.waitForSelector('table', { state: 'visible', timeout: 90000 });
            const tableHeaderCells = await page.locator('table thead tr:nth-child(2) th:nth-child(n)').allInnerTexts();
            const selectedColumnIndex = tableHeaderCells.findIndex(text => text.trim() === interestRatesPeriod[selectedPeriod]) + 1;
            const paginationItems: number = await page.locator('ul.pagination li').count();
            const interestRates: number[] = (await page.locator(`table tbody tr td:nth-child(${selectedColumnIndex})`).allInnerTexts()).map(text => parseFloat(text.replace(',', '.')));

            if (paginationItems > 0) {
                for (let i = 0; i < paginationItems - 5; i++) {
                    await page.getByRole('link', { name: "›" }).first().click();
                    await page.waitForSelector('table', { state: 'visible', timeout: 90000 });
                    interestRates.push(...(await page.locator(`table tbody tr td:nth-child(${selectedColumnIndex})`).allInnerTexts()).map(text => parseFloat(text.replace(',', '.'))));
                }
            }

            const averageInterestRate = interestRates.reduce((sum, rate) => sum + rate, 0) / interestRates.length;

            const regexLetters = /[a-zA-Z]/gm

            const structureResultObject: DataScraperSucess = {
                consultPeriod: period?.replaceAll(regexLetters, "-"),
                modality: modality,
                averageInterestRate: Number(averageInterestRate.toFixed(2)),
                interestRatePeriod: interestRatesPeriod[selectedPeriod],
            }

            scraperSucessResult.push(structureResultObject);


        } catch (error) {
            await browser.close();
            return {
                sucess: false,
                error: { type: 'connectionError' }
            }
        }
    }

    await browser.close();
    console.timeEnd('tempo')

    return {
        sucess: true,
        result: {
            sucess: scraperSucessResult,
            error: scraperErrorResult
        }
    }

}

(
    async () => {
        const res = await interestRateDataScraper({
            searchTargets: searchTarget,
            selectedPeriod: 'Mensal'
        });
        if (res.sucess) {
            console.log(res.result.sucess);

        }
    }
)()