import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import EmpresaForm from "../../../components/EmpresaForm/EmpresaForm";

import empresaService from "../services/empresaService";

function Empresas() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const columns = [
    {
      field: "razaoSocial",
      headerName: "Razão Social",
      flex: 2,
    },
    {
      field: "nomeFantasia",
      headerName: "Nome Fantasia",
      flex: 2,
    },
    {
      field: "cnpj",
      headerName: "CNPJ",
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

  async function carregarEmpresas() {
    try {
      const empresas = await empresaService.listar();
      setRows(empresas);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar empresas.");
    }
  }

  async function salvarEmpresa(dados) {
    try {
      if (empresaSelecionada) {
        await empresaService.atualizar(empresaSelecionada.id, dados);
        setMensagem("Empresa atualizada com sucesso.");
      } else {
        await empresaService.criar(dados);
        setMensagem("Empresa cadastrada com sucesso.");
      }

      await carregarEmpresas();

      setOpenForm(false);
      setEmpresaSelecionada(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao salvar empresa.");

      throw error;
    }
  }

  async function desativarEmpresa(id) {
    try {
      await empresaService.desativar(id);
      await carregarEmpresas();

      setTipoMensagem("success");
      setMensagem("Empresa desativada com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar empresa:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao desativar empresa.");
    }
  }

  function editarEmpresa(empresa) {
    setEmpresaSelecionada(empresa);
    setOpenForm(true);
  }

  useEffect(() => {
    carregarEmpresas();
  }, []);

  return (
    <BasePage
      title="Empresas"
      subtitle="Cadastro de Empresas"
      buttonLabel="Nova Empresa"
      onButtonClick={() => {
        setEmpresaSelecionada(null);
        setOpenForm(true);
      }}
    >
      <BaseCrudTable
        rows={rows}
        columns={columns}
        onEdit={editarEmpresa}
        onDelete={desativarEmpresa}
      />

      <EmpresaForm
        open={openForm}
        empresa={empresaSelecionada}
        onClose={() => {
          setOpenForm(false);
          setEmpresaSelecionada(null);
        }}
        onSave={salvarEmpresa}
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

export default Empresas;