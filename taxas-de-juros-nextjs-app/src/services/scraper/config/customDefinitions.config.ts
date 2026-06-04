import playwright from 'playwright';

export async function customContext(browser: playwright.Browser): Promise<playwright.BrowserContext> {
    const context = await browser.newContext({
        timezoneId: 'America/Sao_Paulo',
        locale: 'pt-BR'
    });
    return context;
};

export const customOptimizationBrowserArgsLaunch = [
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--ignore-certificate-errors'
];

export async function customOptimizationPageRoute(page: playwright.Page): Promise<void> {
    page.route("**/*", (route) => {
        const type = route.request().resourceType()

        if (["image", "font", "media"].includes(type)) {
            route.abort()
        } else {
            route.continue()
        }
    });
};

export async function customRefreshPage(context: playwright.BrowserContext, page: playwright.Page): Promise<playwright.Page> {
    page.close();
    return context.newPage();
};
