import { ModeToggle } from "./mode-toggle";

interface CabecalhoProps {
    tab: string;
}

export function Cabecalho( {tab}: CabecalhoProps) {
    return (
        <>
            <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-bold">EasyCarCare - {tab}</h1>
                <div>
                    <ModeToggle />
                </div>
            </div>
        </>
    )
}