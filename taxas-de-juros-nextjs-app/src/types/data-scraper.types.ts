export interface FinancialInstitutionRate {
    readonly institutionName: string,
    readonly institutionCnpj: string,
    readonly interestRate: string
}

export interface ModalityInterestRates {
    readonly modality: string;
    readonly validFrom: string;
    readonly validTo: string;
    readonly rates: FinancialInstitutionRate[];
}

export interface DataScraperError {
    type: 'targetError' | 'connectionError' | 'columnError';
    errorTarget?: string;
    errorDetails?: unknown
}

interface DataScraperSuccess {
    interestRatePeriod: string;
    modalities: ModalityInterestRates[];
}

export interface DataScraperResult {
    passed?: DataScraperSuccess;
    failed?: DataScraperError[];
}

export type DataScraperType = { success: true, result: DataScraperResult } | { success: false, error: DataScraperError }

export type ScraperTargetType = { success: true, data: ModalityInterestRates } | { success: false, error: DataScraperError }

