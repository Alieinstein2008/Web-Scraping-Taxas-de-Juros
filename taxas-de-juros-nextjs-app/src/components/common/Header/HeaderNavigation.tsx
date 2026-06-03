import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from "next/link"

const customStyleMenuLink = "hover:bg-[#93005b] rounded-lg p-2 transition-all"

export default function HeaderNavigation() {
    return (
        <NavigationMenu className="h-full">
            <NavigationMenuList className="gap-5">
                <NavigationMenu className="text-white" orientation="horizontal">
                    <NavigationMenuList className="gap-5">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Web Scraping</NavigationMenuTrigger>
                            <NavigationMenuContent className="bg-[#7a004b] text-white absolute left-0 w-100">
                                <NavigationMenuLink asChild className={customStyleMenuLink}>
                                    <Link href="/taxas-de-juros">Taxas de Juros</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild className={customStyleMenuLink}>
                                    <Link href="/proconsumidor">Proconsumidor</Link>
                                </NavigationMenuLink>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <NavigationMenu className="text-white" orientation="horizontal">
                    <NavigationMenuList className="gap-5">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Educação</NavigationMenuTrigger>
                            <NavigationMenuContent className="bg-[#7a004b] text-white">
                                <NavigationMenuLink asChild className={customStyleMenuLink}>
                                    <Link href="/biblioteca">Biblioteca</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild className={customStyleMenuLink}>
                                    <Link href="/certificados">Certificados</Link>
                                </NavigationMenuLink>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink href="/sobre" className={customStyleMenuLink}>
                                Sobre
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList >
                </NavigationMenu >
            </NavigationMenuList>
        </NavigationMenu>

    )
}