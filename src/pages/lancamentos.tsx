import { Cabecalho } from "../components/cabecalho";
import { DatePickerDemo } from "../components/datePicker";
import { ScrollArea } from "../components/ui/scroll-area";
import { useState, useEffect } from "react";
import axios from "axios";


export interface lancamento {
  id: string
  descricao: string
  data: Date
  valor: number
  entrada: boolean
}


export default function Lancamentos() {
  const [lancamentos, setLancamentos] = useState<lancamento[]>([])


  useEffect(() => {
    // fetch data
    loadLancamentos()
  }, [])

  const loadLancamentos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/lancamentos')
      if (response.status === 200) {
        setLancamentos(response.data)
      }
    } catch (error) {
      console.error(error)
    }
  }
  const [searchDate, setSearchDate] = useState<Date | undefined>(new Date());
  return (
    <>
      <div className="flex flex-col h-screen w-screen p-4">
        <Cabecalho tab="Lancamentos" />
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-2xl font-bold">Lancamentos</h1>
          <DatePickerDemo date={searchDate} setDate={setSearchDate} />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)] mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        </div>
      </ScrollArea>
    </>
  )
}
