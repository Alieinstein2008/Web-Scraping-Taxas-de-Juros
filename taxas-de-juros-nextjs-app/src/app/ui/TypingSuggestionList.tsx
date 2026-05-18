import { ListPlus } from "lucide-react";

interface TypingSuggestionListProps {
    suggestions: string[];
    onClickSuggestion: (suggestion: string) => void;
}

export default function TypingSuggestionList({ suggestions, onClickSuggestion }: TypingSuggestionListProps) {
    return (
        <>
            {
                suggestions.length > 0 && (
                    <ul
                        className="absolute z-10 top-full mt-2.5 w-50/100 border-2 border-grey-300 bg-white list-none block p-2 rounded-lg pointer-events-none"
                        onMouseUp={(e) => {
                            if (e.target instanceof HTMLElement) {
                                e.currentTarget.style.display = "none";
                            };
                        }}
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => onClickSuggestion(suggestion)}
                                className="p-2 flex items-center gap-x-2 border-gray-100 text-base cursor-pointer rounded-lg hover:bg-gray-100 only-of-type:bg-gray-100 pointer-events-auto text-wrap"
                            >
                                <ListPlus size={14} />
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )
            }
        </>
    );
}