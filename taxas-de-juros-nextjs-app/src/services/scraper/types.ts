export interface FinancialInstitutionRate {
    readonly institutionName: string,
    readonly institutionCnpj: string,
    readonly rawInterestRate: string
}

export interface ModalityInterestRates {
    readonly modality: string;
    readonly validityPeriod: string;
    readonly rates: FinancialInstitutionRate[];
}

export interface DataScraperError {
    type: 'internalTargetError' | 'externalTargetError' | 'connectionError' | 'columnError' | 'internalScraperError' | 'unexpectedScraperError';
    errorTarget?: string;
    errorDetails?: unknown
}

interface DataScraperSuccess {
    readonly interestRatePeriod: string;
    readonly modalities: ModalityInterestRates[];
}

export interface DataScraperResult {
    passed?: DataScraperSuccess;
    failed?: DataScraperError[];
}

export interface ScraperBatchResult {
    success: ModalityInterestRates[];
    errors: DataScraperError[];
}

export type DataScraperType = { success: true, result: DataScraperResult } | { success: false, error: DataScraperError }

export type ScraperTargetType = { success: true, data: ModalityInterestRates } | { success: false, error: DataScraperError }
