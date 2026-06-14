import { Copy, RotateCw } from "lucide-react";

interface DynamicTableHeaderProps {
    selectedInterestRatePeriod: string;
    onClickRefreshButton: () => void;
    onClickCopyButton: () => void;
}

export default function DynamicTableHeader({ selectedInterestRatePeriod, onClickRefreshButton, onClickCopyButton }: DynamicTableHeaderProps) {
    return (
        <header className="w-full h-10 text-white flex items-baseline-last justify-end gap-x-7 px-4 rounded-t-lg rounded-b-none bg-[#80004f] ">
            <p className="text-center text-base lowcase select-none">{selectedInterestRatePeriod}</p>
            <figure onClick={onClickRefreshButton} className="h-8.5 w-8.5 hover:cursor-pointer rounded-lg hover:bg-muted/20 flex items-center justify-center">
                <RotateCw className="h-5 w-5"></RotateCw>
            </figure>
            <figure onClick={onClickCopyButton} className="h-8.5 w-8.5 hover:cursor-pointer rounded-lg hover:bg-muted/20 flex items-center justify-center">
                <Copy className="h-5 w-5"></Copy>
            </figure>
        </header>
    )
}