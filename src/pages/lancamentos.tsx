import { Cabecalho } from "../components/cabecalho";
import { ScrollArea } from "../components/ui/scroll-area";
import DatePickerWithRange from "../components/dateRangePicker";
import { DateRange } from "react-day-picker";
import { useState, useEffect } from "react";
import axios from "axios";

export interface lancamento {
  id: string
  clienteId: string
  descricao: string
  data: Date
  valor: number
  entrada: boolean
}


export default function Lancamentos() {
  const [lancamentos, setLancamentos] = useState<lancamento[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })


  useEffect(() => {
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
  const filterLancamentos = () => {
    if (dateRange?.from && dateRange?.to) {
      return lancamentos.filter((lancamento) => {
        const lancamentoDate = new Date(lancamento.data)
        return lancamentoDate >= dateRange.from && lancamentoDate <= dateRange.to
      })
    }
    return lancamentos
  }

  const resumoLancamentos = () => {
    let totalEntrada = 0
    let totalSaida = 0
    filterLancamentos().forEach((lancamento) => {
      if (lancamento.entrada) {
        totalEntrada += lancamento.valor
      } else {
        totalSaida += lancamento.valor
      }
    })
    return {
      totalEntrada,
      totalSaida
    }
  }

  return (
    <>
      {/* Cabecalho */}
      <div className="flex flex-col h-screen w-screen p-4">
        <Cabecalho tab="Lancamentos" />
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-2xl font-bold">Lancamentos</h1>
        </div>

        {/* Lista de lancamentos */}
        <ScrollArea className="h-[calc(100vh-200px)] mt-4">
          <div className="flex justify-center items-center gap-2">
            <DatePickerWithRange className="w-full" onChange={(range) => setDateRange(range)} />
          </div>
          <h1 className="text-lg font-bold mt-4">Resumo do período</h1>
          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-2 py-4">
              <span className="text-green-500 font-bold">Entradas: R$ {resumoLancamentos().totalEntrada.toFixed(2)}</span>
              <span className="text-red-500 font-bold">Saídas: R$ {resumoLancamentos().totalSaida.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filterLancamentos().map((lancamento) => (
              <div key={lancamento.id} className="bg-muted p-4 rounded-md shadow-md flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-bold">{lancamento.descricao}</h1>
                  <span className={`text-sm font-bold ${lancamento.entrada ? 'text-green-500' : 'text-red-500'}`}>{lancamento.entrada ? 'Entrada' : 'Saída'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Data: {new Date(lancamento.data).toLocaleDateString('pt-BR')}</span>
                  <span>Valor: R$ {lancamento.valor.toFixed(2)}</span>
                </div>
              </div>
            ))

            }
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
