export interface DataScraperError {
    type: 'targetError' | 'connectionError';
    errorTarget?: string;
}

export interface DataScraperSucess {
    consultPeriod?: string;
    modality: string;
    averageInterestRate: string;
    interestRatePeriod: string;
}

export interface DataScraperResult {
    sucess?: DataScraperSucess[];
    error?: DataScraperError[];
}

export type DataScraperType = { sucess: true, result: DataScraperResult } | { sucess: false, error: DataScraperError }
