import { useEffect, useState } from "react";
import { Cabecalho } from "../components/cabecalho";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "../components/ui/dialog";
import { v4 as uuid } from 'uuid';
import { toast } from "sonner";
import axios from "axios";

export interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
}

export default function Estoque() {

  const [isOpen, setIsOpen] = useState(false);

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [produtoSearch, setProdutoSearch] = useState("");

  useEffect(() => {
    loadProdutos();
  }, []);

  useEffect(() => {
    alertEstoque();
  }, [produtos]);

  useEffect(() => {
    loadProdutos()
  }, [produtoSearch]);

  const loadProdutos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/estoque")
      if (response.status === 200) {
        if (produtoSearch.length > 0) {
          setProdutos(response.data.filter((produto: Produto) => produto.nome.toLowerCase().includes(produtoSearch.toLowerCase())));
        } else {
          setProdutos(response.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const alertEstoque = () => {
    produtos.forEach(produto => {
      if (produto.quantidade <= 10) {
        toast.warning("Produto " + produto.nome + " está com a quantidade de " + produto.quantidade + "!");
        return;
      }
    });
  }

  const handleOpen = () => {
    setSelectedProduto(null);
    setIsOpen(true);
    setNome("");
    setQuantidade("");
    setPreco("");
  };

  const handleOpenEdit = (produto: Produto) => {
    setSelectedProduto(produto);
    setNome(produto.nome);
    setQuantidade(produto.quantidade.toString());
    setPreco(produto.preco.toString().replace('.', ','));
    setIsOpen(true);
  }

  const handleSave = async () => {
    if (nome === "" || quantidade === "" || preco === "") {
      toast.error("Preencha todos os campos!");
      return;
    }

    const parsedPreco = parseFloat(preco.replace(',', '.'));

    if (selectedProduto) {
      try {
        const response = await axios.put(`http://localhost:3000/estoque/${selectedProduto.id}`, {
          nome: nome,
          quantidade: parseInt(quantidade),
          preco: parsedPreco,
        });
        if (response.status === 200) {
          setProdutos(produtos.map(produto => produto.id === selectedProduto.id ? response.data : produto));
          setNome("");
          setQuantidade("");
          setPreco("");
          toast.success("Produto atualizado com sucesso!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao atualizar produto!");
      }
    } else {
      try {
        const response = await axios.post("http://localhost:3000/estoque", {
          id: uuid(),
          nome: nome,
          quantidade: parseInt(quantidade),
          preco: parsedPreco,
        });

        if (response.status === 201) {
          setProdutos([...produtos, response.data]);
          setNome(nome)
          setQuantidade(quantidade);
          setPreco(preco);
          toast.success("Produto adicionado com sucesso!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao adicionar produto!");
      }
    }
  }

  const handleDelete = async () => {
    if (selectedProduto) {
      try {
        const response = await axios.delete(`http://localhost:3000/estoque/${selectedProduto.id}`);
        if (response.status === 200) {
          setProdutos(produtos.filter(produto => produto.id !== selectedProduto.id));
          setSelectedProduto(null);
          toast.success("Produto excluído com sucesso!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir produto!");
      }
    } else {
      toast.error("Selecione um produto para excluir!");
    }
  }

  return (
    <>
      <div className="flex flex-col h-screen w-screen p-4 gap-2">
        <Cabecalho tab="Estoque" />
        <div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center mt-0 sm:mt-8 gap-2">
          <Input placeholder="Pesquisar..." className="w-full sm:w-auto" value={produtoSearch} onChange={(e) => setProdutoSearch(e.target.value)} />
          <Button onClick={handleOpen} className="w-full sm:w-auto">Novo Produto</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {produtos.map((produto: Produto) => (
            <Card onClick={() => handleOpenEdit(produto)} className="cursor-pointer">
              <CardContent>
                <CardHeader>
                  <CardTitle>{produto.nome}</CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Quantidade</Label>
                    <Label className="text-sm font-bold">{produto.quantidade}</Label>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Valor</Label>
                    <Label className="text-sm font-bold">{produto.preco.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
              <DialogDescription>Insira os dados do novo produto</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-2" onSubmit={async () => await handleSave()}>
              <Input placeholder="Nome" className="w-full" value={nome} onChange={(e) => setNome(e.target.value)} />
              <Input placeholder="Quantidade" className="w-full" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
              <Input placeholder="Preço" className="w-full" value={preco} onChange={(e) => setPreco(e.target.value)} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                {selectedProduto && (<Button variant={"destructive"} onClick={handleDelete}>Excluir</Button>)}
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
