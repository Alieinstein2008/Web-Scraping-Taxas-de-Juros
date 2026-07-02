import playwright from 'playwright';
import { BROWSER_LOCALE, BLOCKED_RESOURCE_PATTERNS } from './config';

export async function customContext(browser: playwright.Browser): Promise<playwright.BrowserContext> {
    return await browser.newContext(BROWSER_LOCALE);
}

export async function customOptimizationPageRoute(page: playwright.Page): Promise<void> {
    for (const pattern of BLOCKED_RESOURCE_PATTERNS) {
        await page.route(pattern, route => route.abort());
    }
}