import { useEffect, useState } from "react";
import { Cabecalho } from "../components/cabecalho";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import axios from "axios";
import { toast } from "sonner";
import { v4 as uuid } from 'uuid';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tempo: string;
  produtosUsados: string;
}

export default function Servicos() {

  const [servicos, setServicos] = useState<Servico[]>([]);

  const [servicoSearch, setServicoSearch] = useState<string>("");

  const [nome, setNome] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [preco, setPreco] = useState<string>("");
  const [tempo, setTempo] = useState<string>("");
  const [produtosUsados, setProdutosUsados] = useState<string>("");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);

  useEffect(() => {
    loadServicos();
  }, []);

  useEffect(() => {
    loadServicos();
  }, [servicoSearch]);

  const loadServicos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/servicos')
      if (response.status === 200) {
        if (servicoSearch.length > 0) {
          setServicos(response.data.filter((servico: Servico) => servico.nome.toLowerCase().includes(servicoSearch.toLowerCase())));
        } else {
          setServicos(response.data);
        }
      } else {
        setServicos([]);
        console.log('Erro ao carregar serviços', response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços', error);
    }
  }

  const handleOpen = () => {
    setSelectedServico(null);
    setIsOpen(true);
    setNome('');
    setDescricao('');
    setPreco('');
    setTempo('');
    setProdutosUsados('');
  }

  const handleOpenEdit = (servico: Servico) => {
    setSelectedServico(servico);
    setNome(servico.nome);
    setDescricao(servico.descricao);
    setPreco(servico.preco.toString().replace('.', ','));
    setTempo(servico.tempo);
    setProdutosUsados(servico.produtosUsados);
    setIsOpen(true);
  }

  const handleSave = async () => {
    if (nome === "" || descricao === "" || preco === "" || tempo === "" || produtosUsados === "") {
      toast.error("Preencha todos os campos!");
      return;
    }

    const parsedPreco = parseFloat(preco.replace(',', '.'));

    if (selectedServico) {
      try {
        const response = await axios.put(`http://localhost:3000/servicos/${selectedServico.id}`, {
          nome: nome,
          descricao: descricao,
          preco: parsedPreco,
          tempo: tempo,
          produtosUsados: produtosUsados,
        });
        if (response.status === 200) {
          setServicos(servicos.map(servico => servico.id === selectedServico.id ? response.data : servico));
          setSelectedServico(response.data);
          toast.success("Serviço atualizado com sucesso!");
          setIsOpen(false);
        } else {
          toast.error("Erro ao atualizar serviço!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao atualizar serviço!");
      }
    } else {
      try {
        const response = await axios.post("http://localhost:3000/servicos", {
          id: uuid(),
          nome: nome,
          descricao: descricao,
          preco: parsedPreco,
          tempo: tempo,
          produtosUsados: produtosUsados,
        });

        if (response.status === 201) {
          setServicos([...servicos, response.data]);
          toast.success("Serviço adicionado com sucesso!");
          setIsOpen(false);
        } else {
          toast.error("Erro ao adicionar serviço!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao adicionar serviço!");
      }
    }
  }

  const handleDelete = async () => {
    if (selectedServico) {
      try {
        const response = await axios.delete(`http://localhost:3000/servicos/${selectedServico.id}`);
        if (response.status === 200) {
          setServicos(servicos.filter(servico => servico.id !== selectedServico.id));
          setSelectedServico(null);
          toast.success("Serviço excluído com sucesso!");
          setIsOpen(false);
        } else {
          toast.error("Erro ao excluir serviço!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir serviço!");
      }
    } else {
      toast.error("Selecione um serviço para excluir!");
    }
  }

  return (
    <>
      <div className="flex flex-col h-screen w-screen p-4 gap-2">
        <Cabecalho tab="Servicos" />
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-0 sm:mt-8 gap-2">
          <Input placeholder="Pesquisar..." className="w-full sm:w-auto" onChange={(e) => setServicoSearch(e.target.value)} />
          <Button className="w-full sm:w-auto" onClick={handleOpen}>Novo Serviço</Button>
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {servicos.map((servico: Servico) => (
              <div key={servico.id} className="bg-muted p-3 rounded-md cursor-pointer" onClick={() => handleOpenEdit(servico)}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{servico.nome}</span>
                  <span className="text-xs text-muted-foreground">{servico.preco.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {servico.descricao}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Principais produtos usados: {servico.produtosUsados}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
            <DialogDescription>Insira os dados do novo serviço</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-2" onSubmit={async () => await handleSave()}>
            <Input placeholder="Nome" className="w-full" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input placeholder="Descrição" className="w-full" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            <Input placeholder="Preço" className="w-full" value={preco} onChange={(e) => setPreco(e.target.value)} />
            <Input placeholder="Tempo" className="w-full" value={tempo} onChange={(e) => setTempo(e.target.value)} />
            <Input placeholder="Produtos usados" className="w-full" value={produtosUsados} onChange={(e) => setProdutosUsados(e.target.value)} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="reset">Cancelar</Button>
              </DialogClose>
              {selectedServico && (<Button variant={"destructive"} type="reset" onClick={handleDelete}>Excluir</Button>)}
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}