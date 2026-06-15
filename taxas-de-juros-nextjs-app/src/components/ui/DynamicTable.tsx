"use client"

import { poppins } from "@/src/app/layout";
import DynamicTableHeader from "./DynamicTableHeader";
import { Cell, Matrix, Row } from "@/src/types/matrix";

interface DynamicTableProps {
    selectedInterestRatePeriod: string;
    tableData: Matrix;
    onClickRefreshButton: () => void;
}

export default function DynamicTable({ tableData, selectedInterestRatePeriod, onClickRefreshButton }: DynamicTableProps) {
    return (
        <section className={`${poppins.className} bg-card w-95/100 h-fit self-center flex justify-center items-center flex-col mt-1 mb-10 rounded-lg border border-border shadow-lg overflow-clip`}>
            <DynamicTableHeader selectedInterestRatePeriod={selectedInterestRatePeriod} onClickCopyButton={() => alert('copiado')} onClickRefreshButton={onClickRefreshButton}></DynamicTableHeader>
            <div className=" text-white flex justify-center w-100/100 h-fit rounded-lg rounded-t-none overflow-clip bg-[#80004f]">
                {
                    tableData.getNumberRows() > 0 && (
                        <table className="border-collapse rounded-lg rounded-t-none text-[0.6rem] overflow-clip w-full">
                            <thead>
                                <tr>
                                    <th colSpan={tableData.HeaderRow.getNumberColumns()} className="bg-[#80004f] px-3 py-2.5 text-center text-[0.825rem] font-semibold uppercase tracking-[0.25em] text-white">
                                        {'TAXA DE JUROS MÉDIA (BACEN)'}
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={tableData.HeaderRow.getNumberColumns()} className="bg-[#73004b] px-3 py-1.5 text-center text-[0.725rem] font-semibold uppercase tracking-[0.2em] text-white">
                                        {'MODALIDADE'}
                                    </th>
                                </tr>
                                <tr className="bg-slate-100 text-left uppercase tracking-[0.12em] text-slate-600">
                                    {
                                        tableData.HeaderRow.Cells.map((cell, index) => <th className="border border-slate-200 px-3 py-1.5" key={index}>{cell.value}</th>)
                                    }
                                </tr>
                            </thead>
                            <tbody className={`text-black text-[0.65rem]`}>
                                {
                                    tableData.getBodyRows().map((bodyRow, indexBodyRow) =>
                                        <tr key={indexBodyRow} className="odd:bg-white even:bg-slate-50">
                                            {
                                                bodyRow.Cells.map((cell, index) => <td key={index} className="border border-slate-200 px-3 py-2.5 text-left">{cell.value}</td>)
                                            }
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    )
                }
            </div>
        </section>
    )
}