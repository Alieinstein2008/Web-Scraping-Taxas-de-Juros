import { poppins } from "@/src/app/layout";
import AddButton from "./AddButton";
import TypingSuggestionList from "./TypingSuggestionList";

interface SearchInputProps {
    id: string;
    label: string;
    valueInput: string;
    placeholder: string;
    suggestions: string[];
    onChangeInput: (value: string) => void;
    onClickAddButton: (valueInput: string) => void;
    onClickSuggestion: (suggestion: string) => void;
}

export default function SearchInput({ id, label, valueInput, placeholder, suggestions, onChangeInput, onClickAddButton, onClickSuggestion }: SearchInputProps) {
    return (
        <article className={`${poppins.className} w-1/2 h-26 self-center flex flex-col gap-y-0.5`}>
            <label
                htmlFor={id}
                className="text-base h-fit w-full"
            >
                {label}
            </label>
            <div className="relative w-full h-13 flex gap-x-2 items-center">
                <input
                    id={id}
                    value={valueInput}
                    type="text"
                    placeholder={placeholder}
                    onChange={(e) => onChangeInput(e.target.value)}
                    autoComplete="off"
                    className="border border-gray-300 rounded-lg p-2 w-90/100 h-full inline"
                />
                <TypingSuggestionList suggestions={suggestions} onClickSuggestion={onClickSuggestion}></TypingSuggestionList>
                <AddButton valueInput={valueInput} onClickAddButton={onClickAddButton}></AddButton>
            </div>
        </article>
    )
}