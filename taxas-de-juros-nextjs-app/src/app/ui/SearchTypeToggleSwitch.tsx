"use client"

import { useEffect, useRef } from "react";

import { poppins } from "../layout";

interface SearchTypeToggleSwitch {
    textOnLeftSide: string;
    textOnRightSide: string;
    binaryMap: { [key: string]: string }
    onToggle: (binaryMapValue: string) => void
}

export default function SearchTypeToggleSwitch({ textOnLeftSide, textOnRightSide, binaryMap, onToggle }: SearchTypeToggleSwitch) {

    type BinaryMapKeys = keyof typeof binaryMap;

    let indexKey = useRef(1);

    const handleChange = () => {
        indexKey.current = indexKey.current ? 0 : 1;
        onToggle(binaryMap[Object.keys(binaryMap)[indexKey.current] as BinaryMapKeys])
    }

    useEffect(handleChange, []);

    return (
        <figure className={`${poppins.className} w-full h-fit self-center flex items-center justify-center text-base capitalize`}>
            <label className="inline-flex items-center cursor-pointer">
                <span className="select-none font-medium text-heading">{textOnLeftSide}</span>
                <input onChange={handleChange} type="checkbox" value={0} className="sr-only peer" />
                <div className="relative mx-3 w-9 h-5 bg-[#7a004b] peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-[#7a004b]/70 dark:peer-focus:ring-[#7a004b]/70 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7a004b]"></div>
                <span className="select-none font-medium text-heading">{textOnRightSide}</span>
            </label>

        </figure>
    )
}