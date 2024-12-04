import { useEffect, useState } from "react";
import { Cabecalho } from "../components/cabecalho";
import { DatePickerDemo } from "../components/datePicker";
import { Cliente } from "./clientes";
import { Servico } from "./servicos";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "../components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import axios from "axios";
import { toast } from "sonner";
import { v4 as uuid } from 'uuid';
import { ScrollArea } from "../components/ui/scroll-area";

export interface Agenda {
  id: string;
  clienteId: string;
  veiculoId: string;
  servicoId: string;
  data: Date;
  hora: string;
  observacoes: string;
}

export default function Agenda() {

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [agenda, setAgenda] = useState<Agenda[]>([]);

  // const [date, setDate] = useState<Date>();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [veiculo, setVeiculo] = useState<string>("");
  const [cliente, setCliente] = useState<string>("");
  const [servico, setServico] = useState<string>("");
  const [data, setData] = useState<Date | undefined>(new Date());
  const [hora, setHora] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  const [searchDate, setSearchDate] = useState<Date | undefined>(new Date());
  const [searchCliente, setSearchCliente] = useState<string>("");

  useEffect(() => {
    loadClientes();
    loadServicos();
    loadAgenda();
  }, []);

  useEffect(() => {
    loadAgenda();
  }, [searchCliente, searchDate]);

  const loadClientes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/clientes');
      if (response.status === 200) {
        setClientes(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const loadServicos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/servicos');
      if (response.status === 200) {
        setServicos(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const loadAgenda = async () => {
    try {
      const response = await axios.get('http://localhost:3000/agenda');
      if (response.status === 200) {
        const agendamentos = response.data;
        const filteredAgendamentos = agendamentos.filter((agendamento: Agenda) => {
          const clienteMatch = searchCliente.length === 0 ||
            clientes.find((cliente) => cliente.id === agendamento.clienteId)?.nome.toLowerCase().includes(searchCliente.toLowerCase());
          const dataMatch = !searchDate ||
            new Date(agendamento.data).toDateString() === searchDate.toDateString();
          return clienteMatch && dataMatch;
        });
        setAgenda(filteredAgendamentos);
      }
    } catch (error) {
      console.error("Erro ao carregar a agenda:", error);
    }
  };


  const handleNewAgendament = () => {
    setSelectedAgendamento(null);
    setIsOpen(true);
    setCliente('');
    setVeiculo('');
    setServico('');
    setData(searchDate);
    setHora('');
    setObservacoes('');
  }

  const [selectedAgendamento, setSelectedAgendamento] = useState<Agenda | null>(null);

  const saveAgendamento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cliente || !veiculo || !servico || !data || !hora) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const agendamentoData = {
      id: selectedAgendamento ? selectedAgendamento?.id : uuid(),
      clienteId: cliente,
      veiculoId: veiculo,
      servicoId: servico,
      data,
      hora,
      observacoes,
    };

    try {
      if (selectedAgendamento) {
        const response = await axios.put(
          `http://localhost:3000/agenda/${selectedAgendamento.id}`,
          agendamentoData
        );
        if (response.status === 200) {
          toast.success("Agendamento atualizado com sucesso!");
          setSelectedAgendamento(null);
        }
      } else {
        const response = await axios.post("http://localhost:3000/agenda", agendamentoData);
        if (response.status === 201) {
          toast.success("Agendamento criado com sucesso!");
        }
      }
      setIsOpen(false);
      loadAgenda();
    } catch (error) {
      console.error("Erro ao salvar o agendamento:", error);
      toast.error("Erro ao salvar o agendamento.");
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      const response = await axios.delete(`http://localhost:3000/agenda/${id}`);
      if (response.status === 200) {
        toast.success("Agendamento excluído com sucesso!");
        loadAgenda();
      }
    } catch (error) {
      console.error("Erro ao excluir o agendamento:", error);
      toast.error("Erro ao excluir o agendamento.");
    }
  };

  const openEditDialog = (agendamento: Agenda) => {
    setSelectedAgendamento(agendamento);
    setCliente(agendamento.clienteId);
    setVeiculo(agendamento.veiculoId);
    setServico(agendamento.servicoId);
    setData(new Date(agendamento.data));
    setHora(agendamento.hora);
    setObservacoes(agendamento.observacoes);
    setIsOpen(true);
  };


  return (
    <>
      <div className="flex flex-col h-screen w-screen p-4">
        <Cabecalho tab="Agenda" />
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-8 gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar por cliente, veículo ou serviço..."
              className="w-full sm:w-auto mb-2 sm:mb-0"
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
            />
            <DatePickerDemo date={searchDate} setDate={setSearchDate} />
          </div>
          <Button
            onClick={() => handleNewAgendament()}
            className="w-full sm:w-auto"
          >
            Novo Agendamento
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-200px)] mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {agenda.map((agendamento: Agenda) => (
              <div
                key={agendamento.id}
                className="bg-muted p-3 rounded-md cursor-pointer transition-transform transform hover:scale-101"
                onClick={() => openEditDialog(agendamento)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {clientes.find((cliente) => cliente.id === agendamento.clienteId)?.nome}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {agendamento.hora}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="font-medium flex gap-1">
                    <span>
                      {clientes.find((cliente) => cliente.id === agendamento.clienteId)?.veiculos.find((veiculo) => veiculo.id === agendamento.veiculoId)?.marca}
                    </span>
                    <span>
                      {clientes.find((cliente) => cliente.id === agendamento.clienteId)?.veiculos.find((veiculo) => veiculo.id === agendamento.veiculoId)?.modelo}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({clientes.find((cliente) => cliente.id === agendamento.clienteId)?.veiculos.find((veiculo) => veiculo.id === agendamento.veiculoId)?.placa})
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <label className="text-xs text-muted-foreground">Serviço:</label>
                  <label className="text-sm font-bold">
                    {servicos.find((servico) => servico.id === agendamento.servicoId)?.nome}
                  </label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {agendamento.observacoes}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>Novo Agendamento</DialogHeader>
          <DialogDescription>Insira os dados do novo agendamento</DialogDescription>
          <form className="flex flex-col gap-4" onSubmit={saveAgendamento}>
            <Select defaultValue={cliente} onValueChange={(e) => setCliente(e)} value={cliente}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clientes.map((cliente: Cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select defaultValue={veiculo} onValueChange={(e) => setVeiculo(e)} value={veiculo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clientes
                    .find((c) => c.id === cliente)?.veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {`${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select defaultValue={servico} onValueChange={(e) => setServico(e)} value={servico}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {servicos.map((servico: Servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="w-full flex gap-2">
              <DatePickerDemo date={data} setDate={setData} />
              <Input
                type="text"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                placeholder="Horário"
              />
            </div>
            <Input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="reset">Cancelar</Button>
              </DialogClose>
              {selectedAgendamento && (
                <Button variant={"destructive"} type="reset" onClick={() => deleteAgendamento(selectedAgendamento.id)}>
                  Excluir
                </Button>
              )}
              <Button type="submit" className="w-full sm:w-auto">
                Salvar Agendamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
