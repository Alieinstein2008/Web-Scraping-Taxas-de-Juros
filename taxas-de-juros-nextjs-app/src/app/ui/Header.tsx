import Image from "next/image";
import LogoProcon from '../../../public/HeaderLogo.png';
import { poppins } from "../layout";
import HeaderNavigation from "./HeaderNavigation";

export default function Header({ title }: { title: string }) {
    return (
        <header className={`${poppins.className} bg-[#7a004b] h-48 w-full flex flex-col `}>
            <figure className="w-full h-60/100 flex items-center justify-center">
                <Image src={LogoProcon} alt="Logo do Procon" className="w-fit h-full object-contain self-end" />
            </figure>
            <nav className="w-full h-20/100 mt-auto bg-[#7a004b]  flex items-start justify-end pb-1.5 pr-1.5">
                <HeaderNavigation />
            </nav>
            <h1 className="w-full h-20/100 bg-white text-center align-middle text-[#7a004b] text-2xl mt-auto">{title}</h1>
        </header>
    )
}