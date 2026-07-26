import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import FornecedorForm from "../../../components/FornecedorForm/FornecedorForm";

import fornecedorService from "../services/fornecedorService";

function Fornecedores() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const columns = [
    {
      field: "nome",
      headerName: "Nome",
      flex: 2,
    },
    {
      field: "documento",
      headerName: "CPF/CNPJ",
      flex: 1,
    },
    {
      field: "email",
      headerName: "E-mail",
      flex: 2,
    },
    {
      field: "telefone",
      headerName: "Telefone",
      flex: 1,
    },
  ];

  async function carregarFornecedores() {
    try {
      const fornecedores = await fornecedorService.listar();
      setRows(fornecedores);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar fornecedores.");
    }
  }

  async function salvarFornecedor(dados) {
    try {
      if (fornecedorSelecionado) {
        await fornecedorService.atualizar(fornecedorSelecionado.id, dados);
        setMensagem("Fornecedor atualizado com sucesso.");
      } else {
        await fornecedorService.criar(dados);
        setMensagem("Fornecedor cadastrado com sucesso.");
      }

      await carregarFornecedores();

      setFornecedorSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao salvar fornecedor.");

      throw error;
    }
  }

  async function desativarFornecedor(id) {
    try {
      await fornecedorService.desativar(id);
      await carregarFornecedores();

      setTipoMensagem("success");
      setMensagem("Fornecedor desativado com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar fornecedor:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao desativar fornecedor.");
    }
  }

  function editarFornecedor(fornecedor) {
    setFornecedorSelecionado(fornecedor);
    setOpenForm(true);
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  return (
    <BasePage
      title="Fornecedores"
      subtitle="Cadastro de Fornecedores"
      buttonLabel="Novo Fornecedor"
      onButtonClick={() => {
        setFornecedorSelecionado(null);
        setOpenForm(true);
      }}
    >
      <BaseCrudTable
        rows={rows}
        columns={columns}
        onEdit={editarFornecedor}
        onDelete={desativarFornecedor}
      />

      <FornecedorForm
        open={openForm}
        fornecedor={fornecedorSelecionado}
        onClose={() => {
          setOpenForm(false);
          setFornecedorSelecionado(null);
        }}
        onSave={salvarFornecedor}
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

export default Fornecedores;
