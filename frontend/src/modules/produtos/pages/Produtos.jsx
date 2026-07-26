import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import ProdutoForm from "../../../components/ProdutoForm/ProdutoForm";

import produtoService from "../services/produtoService";

function Produtos() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const columns = [
    {
      field: "codigo",
      headerName: "Código",
      flex: 1,
    },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 3,
    },
    {
      field: "categoria",
      headerName: "Categoria",
      flex: 2,
    },
    {
      field: "unidade",
      headerName: "Unidade",
      flex: 1,
    },
    {
      field: "estoque",
      headerName: "Estoque",
      type: "number",
      flex: 1,
    },
  ];

  async function carregarProdutos() {
    try {
      const produtos = await produtoService.listar();
      setRows(produtos);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar produtos.");
    }
  }

  async function salvarProduto(dados) {
    try {
      if (produtoSelecionado) {
        await produtoService.atualizar(produtoSelecionado.id, dados);
        setMensagem("Produto atualizado com sucesso.");
      } else {
        await produtoService.criar(dados);
        setMensagem("Produto cadastrado com sucesso.");
      }

      await carregarProdutos();

      setProdutoSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao salvar produto.");

      throw error;
    }
  }

  async function desativarProduto(id) {
    try {
      await produtoService.desativar(id);
      await carregarProdutos();

      setTipoMensagem("success");
      setMensagem("Produto desativado com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar produto:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao desativar produto.");
    }
  }

  function editarProduto(produto) {
    setProdutoSelecionado(produto);
    setOpenForm(true);
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <BasePage
      title="Produtos"
      subtitle="Cadastro de Produtos"
      buttonLabel="Novo Produto"
      onButtonClick={() => {
        setProdutoSelecionado(null);
        setOpenForm(true);
      }}
    >
      <BaseCrudTable
        rows={rows}
        columns={columns}
        onEdit={editarProduto}
        onDelete={desativarProduto}
      />

      <ProdutoForm
        open={openForm}
        produto={produtoSelecionado}
        onClose={() => {
          setOpenForm(false);
          setProdutoSelecionado(null);
        }}
        onSave={salvarProduto}
      />

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={5000}
        onClose={() => setMensagem("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={tipoMensagem}
          onClose={() => setMensagem("")}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </BasePage>
  );
}

export default Produtos;
