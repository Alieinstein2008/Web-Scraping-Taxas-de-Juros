"use client"

import { useEffect, useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ItemCardInterface } from '@/src/types/item-card.types';
import { poppins } from "../layout";
import { ItemCard } from './ItemCard';

interface AddedItemsBoardProps {
    itemsOnBoard: ItemCardInterface[];
    onClickRemoveButton: (itemId: string) => void; 
}

export default function AddedItemsBoard({ itemsOnBoard, onClickRemoveButton }: AddedItemsBoardProps) {

    const [isOpen, setIsOpen] = useState(false);
    const renderCounter = useRef(0);

    useEffect(() => {
        itemsOnBoard.length > 0 && renderCounter.current > 0 ? setIsOpen(true) : setIsOpen(false);
        renderCounter.current += 1;
    }, [itemsOnBoard]);

    return (

        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className='w-1/2 data-open:h-fit flex flex-col self-center rounded-lg bg-[#7a004b]/10 data-closed:h-5/100 data-open:opacity-100 data-open:scale-100 data-open:visible opacity-60 scale-90 transition-all duration-300 ease-out origin-top'
        >
            <CollapsibleTrigger
                className='w-10/100 h-full flex items-center justify-center text-[#7a004b] ml-auto rounded-lg p-1 transition-transform duration-300 ease-in-out hover:scale-125 hover:cursor-pointer data-open:-rotate-90'
            >
                <ArrowLeft size={20} />
            </CollapsibleTrigger>

            <CollapsibleContent>
                <section className={`${poppins.className} w-full h-fit empty:h-0 self-center rounded-lg justify-center flex flex-wrap gap-x-1.5 gap-y-2 p-2.5`}>

                    {
                        itemsOnBoard.map((item, index) =>
                            <ItemCard
                                id={item.id}
                                title={item.title}
                                key={index}
                                onClickRemoveButton={onClickRemoveButton}
                            />
                        )
                    }

                </section>
            </CollapsibleContent>
        </Collapsible>
    )
}