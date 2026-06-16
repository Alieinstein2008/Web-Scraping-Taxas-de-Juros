"use client"

import { useState, useEffect } from "react"

import { createId } from "@paralleldrive/cuid2"

import SearchInput from "./SearchInput"
import AddedItemsBoard from "./AddedItemsBoard"
import DynamicTable from "./DynamicTable"
import SearchTypeToggleSwitch from "./SearchTypeToggleSwitch"

import { toast, Toaster } from 'sonner';

import { ItemCardInterface } from "@/src/types/item-card.types"

import { matrix } from "@/src/constants/dynamic-table"
import { DataScraperResult } from "@/src/types/data-scraper.types"
import { SEARCH_TYPE_TOGGLE_SWITCH, TEXT_ON_LEFT_SIDE_OF_TOGGLE_SWITCH, TEXT_ON_RIGHT_SIDE_OF_TOGGLE_SWITCH, TYPING_SUGGESTIONS } from "@/src/constants"

export default function MainContent() {

    const defaultItems: ItemCardInterface[] = TYPING_SUGGESTIONS.reduce((acc: any[], title, index: number) => {
        acc[index] = { id: createId(), title: title };
        return acc;
    }, []);

    const [valueInputSearch, setValueInputSearch] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [itemsOnBoard, setItemsOnBoard] = useState<ItemCardInterface[]>(defaultItems);
    const [selectedInterestRatePeriod, setselectedInterestRatePeriod] = useState<string>('');

    const [loading, setLoading] = useState(false);

    const clearInputValue = () => { setValueInputSearch("") }

    const handleAddItemsOnBoard = (item: string) => {
        if (valueInputSearch !== '' && item) {
            const structuredItemCard: ItemCardInterface = {
                id: createId(),
                title: item
            };

            setItemsOnBoard(prevItems => [...prevItems, structuredItemCard]);
            clearInputValue();
        }
    };

    const handleRemoveItemsOnBoard = (itemId: string) => {
        setItemsOnBoard(itemsOnBoard.filter((item) => item.id !== itemId));
    };

    const handleUserTyping = () => {
        if (valueInputSearch.length > 0) {
            const suggestionFilter = TYPING_SUGGESTIONS.filter(
                option => option.toLowerCase().includes(valueInputSearch.toLowerCase())
            );
            setSuggestions(suggestionFilter);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (selectedSuggestion: string) => {
        setValueInputSearch(selectedSuggestion);
        handleAddItemsOnBoard(selectedSuggestion);
        clearInputValue();
    };

    const handleStartInterestRateDataScraper = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/scraper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchTargets: [...itemsOnBoard.map(items => items.title)],
                    selectedPeriod: selectedInterestRatePeriod
                }),
            });

            const rawData = await response.json();

            console.log(rawData)

            if (response.ok) {
                if (rawData.sucess) {
                    const result: DataScraperResult = rawData.result;
                    if (result.failed && result.failed.length > 0) result.failed?.forEach(target => toast.error(`Modalidade ${target.errorTarget} não encontrada(o)`));
                    else {
                        toast.success('Coleta de dados concluída com sucesso');
                        const newHeaderRow = [
                            'Periodo',
                            'Data de Coleta',
                            ...result.passed?.modalities ?? []
                        ];
                        const newSecondRow = [
                            result.passed?.period,
                            new Date().toLocaleDateString(),
                            ...result.passed?.averageInterestRates ?? []
                        ];

                        console.log(newSecondRow);

                    }

                } else {
                    toast.warning("Não foi possível estabelecer uma conexão segura. Por favor, verifique sua rede de internet.")
                }

            } else {
                toast.error(rawData.error);
            }
        } catch (error) {
            toast.info('Erro ao conectar com o servidor.');

        } finally {
            setLoading(false);
        }
    };

    useEffect(handleUserTyping, [valueInputSearch]);

    return (
        <main className="w-full h-full flex flex-col gap-y-2.5 overflow-auto">
            <Toaster
                position="top-center"
                richColors
            />
            <SearchInput
                id="InputSearch"
                label="Adicione"
                placeholder="Digite algo..."
                valueInput={valueInputSearch}
                onChangeInput={setValueInputSearch}
                suggestions={suggestions}
                onClickAddButton={handleAddItemsOnBoard}
                onClickSuggestion={selectSuggestion}
            ></SearchInput>
            <SearchTypeToggleSwitch textOnLeftSide={TEXT_ON_LEFT_SIDE_OF_TOGGLE_SWITCH} textOnRightSide={TEXT_ON_RIGHT_SIDE_OF_TOGGLE_SWITCH} binaryMap={SEARCH_TYPE_TOGGLE_SWITCH} onToggle={setselectedInterestRatePeriod}></SearchTypeToggleSwitch>
            <AddedItemsBoard itemsOnBoard={itemsOnBoard} onClickRemoveButton={handleRemoveItemsOnBoard}></AddedItemsBoard>
            <DynamicTable tableData={matrix} selectedInterestRatePeriod={selectedInterestRatePeriod} onClickRefreshButton={() => {
                if (!loading) {
                    toast.promise<void>(
                        async () => await handleStartInterestRateDataScraper(),
                        {
                            loading: "Coletando dados...",
                            error: "Error",
                        }
                    )
                }
            }}></DynamicTable>
        </main >
    )
}