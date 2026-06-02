"use client"

import { Data } from "@/src/web/constants";
import { poppins } from "../layout";
import VisualTableHeader from "./VisualTableHeader";
import { useState } from "react";

interface VisualTableProps {
    onClickRefreshButton: () => void;

}

export function VisualTable({ onClickRefreshButton }: VisualTableProps) {

    const [tableData, setTableData] = useState();


    return (
        <section className={`${poppins.className} bg-card w-95/100 h-fit self-center flex justify-center items-center flex-col mt-1 mb-10 rounded-lg border border-border shadow-lg overflow-clip`}>
            <VisualTableHeader interestRatePeriod={'a.m%'} onClickCopyButton={()=>alert('copiado')} onClickRefreshButton={()=>alert('refresh')}></VisualTableHeader>
            <div className=" text-white flex justify-center w-100/100 h-fit rounded-lg rounded-t-none overflow-clip bg-[#80004f]">
                <table className="border-collapse rounded-lg rounded-t-none text-[0.6rem] overflow-clip w-full">
                    <thead>
                        <tr>
                            <th colSpan={Data.modalities.length + 2} className="bg-[#80004f] px-3 py-2.5 text-center text-[0.825rem] font-semibold uppercase tracking-[0.25em] text-white">
                                {Data.title}
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={Data.modalities.length + 4} className="bg-[#73004b] px-3 py-1.5 text-center text-[0.725rem] font-semibold uppercase tracking-[0.2em] text-white">
                                {Data.subTitle}
                            </th>
                        </tr>
                        <tr className="bg-slate-100 text-left uppercase tracking-[0.12em] text-slate-600">
                            {Data.headerRows.map((headerCell, indexHeaderCell) => <th className="border border-slate-200 px-3 py-1.5" key={indexHeaderCell}>{headerCell}</th>)}
                        </tr>
                    </thead>
                    <tbody className={`text-black text-[0.65rem]`}>
                        {
                            Data.bodyRows.map((bodyRow, indexBodyRow) =>
                                <tr key={indexBodyRow} className="odd:bg-white even:bg-slate-50">
                                    {
                                        bodyRow.map((cell, index) => <td key={index} className="border border-slate-200 px-3 py-2.5">{cell}</td>)
                                    }
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </section>
    )
}