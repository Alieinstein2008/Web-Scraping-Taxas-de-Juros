import RemoveButton from "./RemoveButton"

interface ItemCardProps {
    id: string,
    title: string,
    onClickRemoveButton: (itemId: string) => void;
}

export function ItemCard({ id, title, onClickRemoveButton }: ItemCardProps) {
    return (
        <div
            className="w-max h-fit bg-[#7a004b]/90 rounded-lg flex items-center justify-center p-2.5 gap-x-2 hover:cursor-pointer select-none hover:animate-shake"
        >
            <h2 className="text-base text-white text-center text-wrap">{title}</h2>
            <RemoveButton itemId={id} onClickRemoveButton={onClickRemoveButton}></RemoveButton>
        </div>
    )
}