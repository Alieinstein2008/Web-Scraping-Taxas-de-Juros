import { SEARCH_TYPE_TOGGLE_SWITCH } from '@/src/constants';
import { interestRateDataScraper } from '@/src/services/scraper/scraper';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { selectedPeriod, searchTargets } = await request.json();

        const validSelectedPeriod = Object.values(SEARCH_TYPE_TOGGLE_SWITCH).includes(selectedPeriod);

        if (!selectedPeriod || !Array.isArray(searchTargets) || !validSelectedPeriod) {
            return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }

        const data = await interestRateDataScraper({
            searchTargets: searchTargets,
            selectedPeriod: selectedPeriod
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro no POST do scraper:', error);
        return NextResponse.json({ error: 'Falha ao processar scraper' }, { status: 500 });
    }
}
