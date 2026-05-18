import { X } from "lucide-react"

interface RemoveButtonProps {
    itemId: string;
    onClickRemoveButton: (itemId: string) => void;
}

export default function RemoveButton({ itemId, onClickRemoveButton }: RemoveButtonProps) {
    return (
        <button onClick={() => onClickRemoveButton(itemId)} className="text-white/70 hover:cursor-pointer transition-transform duration-300 ease-in-out hover:scale-125 hover:text-white">
            <X size={18} />
        </button>
    )
}