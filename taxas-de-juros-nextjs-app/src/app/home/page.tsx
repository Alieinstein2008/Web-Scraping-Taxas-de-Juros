import Header from "../ui/Header"
import MainContent from "../ui/MainContent"

export default function Home() {
    return (
        <div className="bg-white h-screen w-screen flex flex-col gap-y-3.5 items-center overflow-auto">
            <Header title="Web Scraping Taxa de Juros Banco Central"></Header>
            <MainContent></MainContent>
        </div>
    )
}