export interface DataScraperError {
    type: 'targetError' | 'connectionError';
    errorTarget?: string;
}

interface DataScraperSucess {
    period: string;
    modalities: string[];
    averageInterestRates: string[];
    interestRatePeriod: string;
}

export interface DataScraperResult {
    passed?: DataScraperSucess;
    failed?: DataScraperError[];
}

export type DataScraperType = { sucess: true, result: DataScraperResult } | { sucess: false, error: DataScraperError }
