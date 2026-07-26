import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import ClienteForm from "../../../components/ClienteForm/ClienteForm";

import clienteService from "../services/clienteService";

function Clientes() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
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

  async function carregarClientes() {
    try {
      const clientes = await clienteService.listar();
      setRows(clientes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar clientes.");
    }
  }

  async function salvarCliente(dados) {
    try {
      if (clienteSelecionado) {
        await clienteService.atualizar(clienteSelecionado.id, dados);
        setMensagem("Cliente atualizado com sucesso.");
      } else {
        await clienteService.criar(dados);
        setMensagem("Cliente cadastrado com sucesso.");
      }

      await carregarClientes();

      setClienteSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao salvar cliente.");

      throw error;
    }
  }

  async function desativarCliente(id) {
    try {
      await clienteService.desativar(id);
      await carregarClientes();

      setTipoMensagem("success");
      setMensagem("Cliente desativado com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar cliente:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao desativar cliente.");
    }
  }

  function editarCliente(cliente) {
    setClienteSelecionado(cliente);
    setOpenForm(true);
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  return (
    <BasePage
      title="Clientes"
      subtitle="Cadastro de Clientes"
      buttonLabel="Novo Cliente"
      onButtonClick={() => {
        setClienteSelecionado(null);
        setOpenForm(true);
      }}
    >
      <BaseCrudTable
        rows={rows}
        columns={columns}
        onEdit={editarCliente}
        onDelete={desativarCliente}
      />

      <ClienteForm
        open={openForm}
        cliente={clienteSelecionado}
        onClose={() => {
          setOpenForm(false);
          setClienteSelecionado(null);
        }}
        onSave={salvarCliente}
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

export default Clientes;
