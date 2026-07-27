import { useEffect, useState } from "react";
import { Alert, IconButton, Paper, Snackbar, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import BasePage from "../../../components/BasePage/BasePage";
import EmpresaForm from "../../../components/EmpresaForm/EmpresaForm";
import IntegracaoFiscalForm from "../../../components/IntegracaoFiscalForm/IntegracaoFiscalForm";

import empresaService from "../services/empresaService";

function EmpresaTable({ rows, onEdit, onDelete, onIntegracaoFiscal }) {
  const columns = [
    { field: "razaoSocial", headerName: "Razão Social", flex: 2 },
    { field: "nomeFantasia", headerName: "Nome Fantasia", flex: 2 },
    { field: "cnpj", headerName: "CNPJ", flex: 1 },
    { field: "email", headerName: "E-mail", flex: 2 },
    { field: "telefone", headerName: "Telefone", flex: 1 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => onEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onIntegracaoFiscal(params.row)}
            title="Integração Fiscal"
          >
            <ReceiptLongIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        height: 620,
        borderRadius: 3,
        border: "1px solid rgba(148, 163, 184, 0.14)",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#1B2438" },
          "& .MuiDataGrid-row:hover": { backgroundColor: "#1B2438" },
        }}
      />
    </Paper>
  );
}

function Empresas() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  const [empresaFiscal, setEmpresaFiscal] = useState(null);
  const [integracaoFiscal, setIntegracaoFiscal] = useState(null);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

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

  async function abrirIntegracaoFiscal(empresa) {
    try {
      const dados = await empresaService.buscarIntegracaoFiscal(empresa.id);
      setEmpresaFiscal(empresa);
      setIntegracaoFiscal(dados);
    } catch (error) {
      console.error("Erro ao carregar integração fiscal:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar integração fiscal.");
    }
  }

  async function salvarIntegracaoFiscal(dados) {
    try {
      await empresaService.salvarIntegracaoFiscal(empresaFiscal.id, dados);

      setEmpresaFiscal(null);
      setIntegracaoFiscal(null);

      setTipoMensagem("success");
      setMensagem("Integração fiscal salva com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar integração fiscal:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao salvar integração fiscal.",
      );

      throw error;
    }
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
      <EmpresaTable
        rows={rows}
        onEdit={editarEmpresa}
        onDelete={desativarEmpresa}
        onIntegracaoFiscal={abrirIntegracaoFiscal}
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

      <IntegracaoFiscalForm
        open={Boolean(empresaFiscal)}
        empresa={empresaFiscal}
        integracao={integracaoFiscal}
        onClose={() => {
          setEmpresaFiscal(null);
          setIntegracaoFiscal(null);
        }}
        onSave={salvarIntegracaoFiscal}
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
