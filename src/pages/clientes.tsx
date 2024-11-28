import { toast } from "sonner";
import { Cabecalho } from "../components/cabecalho";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuid } from 'uuid';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Car, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";

export interface Cliente {
  id: string
  nome: string
  telefone: string
  veiculos: Veiculo[]
}

export interface Veiculo {
  id: string
  placa: string
  marca: string
  modelo: string
  cor: string
}

export default function Clientes() {

  const [clientes, setClientes] = useState<Cliente[]>([])

  const [clienteSearch, setClienteSearch] = useState<string>("")
  const [nome, setNome] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")

  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null)
  const [marca, setMarca] = useState<string>("")
  const [modelo, setModelo] = useState<string>("")
  const [cor, setCor] = useState<string>("")
  const [placa, setPlaca] = useState<string>("")

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isDialogCarOpen, setIsDialogCarOpen] = useState<boolean>(false)
  const [selectedCliente, setSelectCliente] = useState<Cliente | null>(null)

  const [expandedClient, setExpandedClient] = useState<string | null>(null)

  useEffect(() => {
    loadClientes()
  }, [])

  useEffect(() => {
    loadClientes();
  }, [clienteSearch]);

  const loadClientes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/clientes")
      if (response.status === 200) {
        if (clienteSearch.length > 0) {
          setClientes(response.data.filter((cliente: Cliente) => cliente.nome.toLowerCase().includes(clienteSearch.toLowerCase())));
        } else {
          setClientes(response.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleOpenDialog = () => {
    setSelectCliente(null)
    setIsOpen(true)
    setNome('')
    setTelefone('')
  }

  const handleNewVeiculo = () => {
    setSelectedVeiculo(null)
    setIsDialogCarOpen(true)
    setMarca('')
    setModelo('')
    setCor('')
    setPlaca('')
  }

  const handleEditCliente = (cliente: Cliente) => {
    setSelectCliente(cliente)
    setIsOpen(true)
    setNome(cliente.nome)
    setTelefone(cliente.telefone)
  }

  const handleOpenEditVeiculo = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setMarca(veiculo.marca);
    setModelo(veiculo.modelo);
    setCor(veiculo.cor);
    setPlaca(veiculo.placa);
    setIsDialogCarOpen(true);
  }

  const toggleExpand = (clientId: string) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
      setSelectCliente(null);
    } else {
      setExpandedClient(clientId);
      const cliente = clientes.find((client) => client.id === clientId);
      setSelectCliente(cliente || null);
    }
  };


  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nome === "" || telefone === "") {
      toast.error("Preencha todos os campos!");
      return;
    }
    try {
      if (selectedCliente) {
        await axios.put(`http://localhost:3000/clientes/${selectedCliente.id}`, {
          id: selectedCliente.id,
          nome,
          telefone,
          veiculos: selectedCliente.veiculos,
        });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const novoCliente: Cliente = {
          id: uuid(),
          nome,
          telefone,
          veiculos: [],
        };
        await axios.post("http://localhost:3000/clientes", novoCliente);
        toast.success("Cliente criado com sucesso!");
      }
      loadClientes();
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar cliente. Tente novamente.");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;
    try {
      await axios.delete(`http://localhost:3000/clientes/${selectedCliente.id}`);
      toast.success("Cliente excluído com sucesso!");
      loadClientes();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir cliente.");
    }
  };

  const handleSaveCar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCliente) return;

    if (marca === "" || modelo === "" || cor === "" || placa === "") {
      toast.error("Preencha todos os campos!");
      return;
    }

    try {
      const updatedVeiculos = selectedVeiculo
        ? selectedCliente.veiculos.map((v) => (v.id === selectedVeiculo.id ? { ...selectedVeiculo, marca, modelo, cor, placa } : v))
        : [...selectedCliente.veiculos, { id: uuid(), marca, modelo, cor, placa }];

      console.log(updatedVeiculos);

      const response = await axios.put(`http://localhost:3000/clientes/${selectedCliente.id}`, { ...selectedCliente, veiculos: updatedVeiculos });
      console.log(response);
      toast.success(selectedVeiculo ? "Veículo atualizado com sucesso!" : "Veículo adicionado com sucesso!");
      setSelectCliente({ ...selectedCliente, veiculos: updatedVeiculos })
      loadClientes();
      setIsDialogCarOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar veículo.");
    }
  };

  const handleDeleteVeiculo = async () => {
    if (!selectedCliente || !selectedVeiculo) return;

    try {
      const updatedVeiculos = selectedCliente.veiculos.filter((v) => v.id !== selectedVeiculo.id);

      await axios.put(`http://localhost:3000/clientes/${selectedCliente.id}`, { ...selectedCliente, veiculos: updatedVeiculos });
      toast.success("Veículo excluído com sucesso!");
      setSelectCliente({ ...selectedCliente, veiculos: updatedVeiculos })
      loadClientes();
      setIsDialogCarOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir veículo.");
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen w-screen p-4 gap-2">
        <Cabecalho tab="Clientes" />
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-0 sm:mt-8 gap-2">
          <Input placeholder="Pesquisar..." className="w-full sm:w-auto" value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)} />
          <Button onClick={handleOpenDialog} className="w-full sm:w-auto">Novo Cliente</Button>
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {clientes.map((client) => (
              <Card key={client.id} className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl">{client.nome}</CardTitle>
                  <CardDescription>Telefone: {client.telefone}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <span>{client.veiculos.length} veículo(s)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(client.id)}
                      aria-expanded={expandedClient === client.id}
                      aria-controls={`vehicle-list-${client.id}`}
                    >
                      {expandedClient === client.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
                {expandedClient === client.id && (
                  <CardFooter>
                    <div id={`vehicle-list-${client.id}`} className="w-full">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold mb-2">Veículos:</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleNewVeiculo()}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <ul className="space-y-2">
                        {client.veiculos.map((vehicle) => (
                          <li key={vehicle.id} className="bg-muted p-3 rounded-md cursor-pointer" onClick={() => handleOpenEditVeiculo(vehicle)}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{vehicle.marca} {vehicle.modelo}</span>
                              <Badge>{vehicle.placa}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Cor: {vehicle.cor}
                            </p>
                          </li>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => handleEditCliente(client)}>Editar Cliente</Button>
                      </ul>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Modal de novo cliente */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>Insira os dados do novo cliente</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-2" onSubmit={handleSave}>
              <Input placeholder="Nome" className="w-full" value={nome} onChange={(e) => setNome(e.target.value)} />
              <Input placeholder="Telefone" className="w-full" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                {selectedCliente && (<Button variant={"destructive"} onClick={handleDelete}>Excluir</Button>)}
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de novo veículo */}
        <Dialog open={isDialogCarOpen} onOpenChange={setIsDialogCarOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Veículo</DialogTitle>
              <DialogDescription>Insira os dados do novo veículo</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-2" onSubmit={handleSaveCar}>
              <Input placeholder="Marca" className="w-full" value={marca} onChange={(e) => setMarca(e.target.value)} />
              <Input placeholder="Modelo" className="w-full" value={modelo} onChange={(e) => setModelo(e.target.value)} />
              <Input placeholder="Cor" className="w-full" value={cor} onChange={(e) => setCor(e.target.value)} />
              <Input placeholder="Placa" className="w-full" value={placa} onChange={(e) => setPlaca(e.target.value)} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                {selectedVeiculo && (<Button variant={"destructive"} type="reset" onClick={handleDeleteVeiculo}>Excluir</Button>)}
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div >
    </>
  )
}