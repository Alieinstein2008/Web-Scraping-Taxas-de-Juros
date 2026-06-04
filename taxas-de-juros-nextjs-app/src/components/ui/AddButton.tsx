import { Plus } from "lucide-react"

interface AddButtonProps {
    valueInput: string;
    onClickAddButton: (valueInput: string) => void;
}

export default function AddButton({ valueInput, onClickAddButton }: AddButtonProps) {
    return (
        <button
            onClick={() => onClickAddButton(valueInput)}
            className="bg-[#7a004b] text-white rounded-lg p-2 w-10/100 h-full inline-flex items-center justify-center hover:bg-[#7a004b]/90 hover:cursor-pointer">
            <Plus size={20} />
        </button>
    )
}