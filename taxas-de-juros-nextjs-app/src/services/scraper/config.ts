export const BROWSER_LOCALE = {
    timezoneId: 'America/Sao_Paulo',
    locale: 'pt-BR'
} as const;

export const OPTIMIZATION_LAUNCH_ARGS = [
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--ignore-certificate-errors'
];

export const BLOCKED_RESOURCE_PATTERNS = [
    '**/*.{png,jpg,jpeg,webp,svg,gif,ico}',
    '**/*.{woff,woff2,eot,ttf,otf}',
    '**/*.{mp4,webm,ogg,mp3,m4a,3gp,3g2,avi}'
] as const;

export const DEFAULT_TIMEOUTS = {
    NAVIGATION: 15000,
    LOADING: 10000,
    TABLE: 8000,
    ELEMENT: 8500,
    STATE: 4000
} as const;