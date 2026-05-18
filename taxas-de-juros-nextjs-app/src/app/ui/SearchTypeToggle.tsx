"use client"

import { useEffect, useRef } from "react";

import { poppins } from "../layout";

interface SearchTypeToggle {
    leftSideText: string;
    rightSideText: string;
    onToggle: (selectedSide: string) => void
}

export default function SearchTypeToggle({ leftSideText, rightSideText, onToggle }: SearchTypeToggle) {

    const sideMapping = {
        0: leftSideText,
        1: rightSideText
    };

    type keyMap = keyof typeof sideMapping;

    let selectedSide = useRef<keyMap>(1);

    const handleChange = () => {
        selectedSide.current = selectedSide.current ? 0 : 1;
        onToggle(sideMapping[selectedSide.current])
    }

    useEffect(handleChange, []);

    return (
        <figure className={`${poppins.className} w-full h-fit self-center flex items-center justify-center text-base capitalize`}>
            <label className="inline-flex items-center cursor-pointer">
                <span className="select-none font-medium text-heading">{leftSideText}</span>
                <input onChange={handleChange} type="checkbox" value={0} className="sr-only peer" />
                <div className="relative mx-3 w-9 h-5 bg-[#7a004b] peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-[#7a004b]/70 dark:peer-focus:ring-[#7a004b]/70 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7a004b]"></div>
                <span className="select-none font-medium text-heading">{rightSideText}</span>
            </label>

        </figure>
    )
}