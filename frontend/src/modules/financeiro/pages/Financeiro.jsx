import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import BasePage from "../../../components/BasePage/BasePage";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import TituloForm from "../../../components/TituloForm/TituloForm";

import tituloService from "../services/tituloService";
import notaFiscalService from "../services/notaFiscalService";

const statusLabel = {
  aberta: "Em aberto",
  paga: "Paga",
  cancelada: "Cancelada",
};

const notaFiscalStatusLabel = {
  pendente: "Pendente",
  emitida: "Emitida",
  cancelada: "Cancelada",
};

const notaFiscalTipoLabel = {
  saida: "Saída",
  entrada: "Entrada",
};

function NotaFiscalTable({ rows, onEmitir, onCancelar }) {
  const columns = [
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      valueGetter: (value) => notaFiscalTipoLabel[value] || value,
    },
    {
      field: "contraparte",
      headerName: "Cliente/Fornecedor",
      flex: 2,
      valueGetter: (_value, row) =>
        row.venda?.cliente?.nome || row.compra?.fornecedor?.nome || "-",
    },
    {
      field: "numero",
      headerName: "Número",
      flex: 1,
      valueGetter: (value) => value || "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueGetter: (value) => notaFiscalStatusLabel[value] || value,
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {params.row.status === "pendente" && (
            <Button size="small" onClick={() => onEmitir(params.row)}>
              Emitir
            </Button>
          )}

          {params.row.status !== "cancelada" && (
            <Button
              size="small"
              color="error"
              onClick={() => onCancelar(params.row.id)}
            >
              Cancelar
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        height: 500,
        borderRadius: 3,
        border: "1px solid #E5E7EB",
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
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8FAFC",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#F8FAFC",
          },
        }}
      />
    </Paper>
  );
}

function TituloTable({ rows, onBaixar, onCancelar, contraparteLabel }) {
  const columns = [
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 2,
    },
    {
      field: "contraparte",
      headerName: contraparteLabel,
      flex: 2,
      valueGetter: (_value, row) =>
        row.cliente?.nome || row.fornecedor?.nome || "-",
    },
    {
      field: "valor",
      headerName: "Valor",
      flex: 1,
      valueGetter: (value) => `R$ ${Number(value).toFixed(2)}`,
    },
    {
      field: "parcela",
      headerName: "Parcela",
      flex: 1,
      valueGetter: (_value, row) =>
        row.parcela && row.totalParcelas
          ? `${row.parcela}/${row.totalParcelas}`
          : "-",
    },
    {
      field: "vencimento",
      headerName: "Vencimento",
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleDateString("pt-BR"),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueGetter: (value) => statusLabel[value] || value,
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.status === "aberta" && (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => onBaixar(params.row.id)}>
              Baixar
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => onCancelar(params.row.id)}
            >
              Cancelar
            </Button>
          </Stack>
        ),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        height: 560,
        borderRadius: 3,
        border: "1px solid #E5E7EB",
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
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8FAFC",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#F8FAFC",
          },
        }}
      />
    </Paper>
  );
}

function Financeiro() {
  const [aba, setAba] = useState("receber");
  const [titulos, setTitulos] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const [notasFiscais, setNotasFiscais] = useState([]);
  const [notaFiscalParaEmitir, setNotaFiscalParaEmitir] = useState(null);
  const [numeroControle, setNumeroControle] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregarTitulos(tipo) {
    try {
      const dados = await tituloService.listar(tipo);
      setTitulos(dados);
    } catch (error) {
      console.error("Erro ao carregar títulos:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar títulos.");
    }
  }

  async function salvarTitulo(dados) {
    try {
      await tituloService.criar(dados);

      setAba(dados.tipo);
      await carregarTitulos(dados.tipo);

      setOpenForm(false);
      setTipoMensagem("success");
      setMensagem("Título lançado com sucesso.");
    } catch (error) {
      console.error("Erro ao lançar título:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao lançar título.");

      throw error;
    }
  }

  async function baixarTitulo(id) {
    try {
      await tituloService.baixar(id);
      await carregarTitulos(aba);

      setTipoMensagem("success");
      setMensagem("Título baixado com sucesso.");
    } catch (error) {
      console.error("Erro ao baixar título:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao baixar título.");
    }
  }

  async function cancelarTitulo(id) {
    try {
      await tituloService.cancelar(id);
      await carregarTitulos(aba);

      setTipoMensagem("success");
      setMensagem("Título cancelado com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar título:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao cancelar título.",
      );
    }
  }

  async function carregarNotasFiscais() {
    try {
      const dados = await notaFiscalService.listar();
      setNotasFiscais(dados);
    } catch (error) {
      console.error("Erro ao carregar notas fiscais:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar notas fiscais.");
    }
  }

  async function emitirNotaFiscal() {
    try {
      await notaFiscalService.emitir(notaFiscalParaEmitir.id, numeroControle);
      setNotaFiscalParaEmitir(null);
      setNumeroControle("");
      await carregarNotasFiscais();

      setTipoMensagem("success");
      setMensagem("Nota fiscal emitida com sucesso.");
    } catch (error) {
      console.error("Erro ao emitir nota fiscal:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao emitir nota fiscal.",
      );

      throw error;
    }
  }

  async function cancelarNotaFiscal(id) {
    try {
      await notaFiscalService.cancelar(id);
      await carregarNotasFiscais();

      setTipoMensagem("success");
      setMensagem("Nota fiscal cancelada com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar nota fiscal:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao cancelar nota fiscal.",
      );
    }
  }

  useEffect(() => {
    if (aba === "notas") {
      carregarNotasFiscais();
    } else {
      carregarTitulos(aba);
    }
  }, [aba]);

  const ehTitulos = aba === "receber" || aba === "pagar";

  return (
    <BasePage
      title="Financeiro"
      subtitle="Contas a Pagar e a Receber"
      buttonLabel={ehTitulos ? "Novo Título" : undefined}
      onButtonClick={() => setOpenForm(true)}
    >
      <Tabs
        value={aba}
        onChange={(_event, valor) => setAba(valor)}
        sx={{ mb: 2 }}
      >
        <Tab value="receber" label="A Receber" />
        <Tab value="pagar" label="A Pagar" />
        <Tab value="notas" label="Notas Fiscais" />
      </Tabs>

      {ehTitulos && (
        <TituloTable
          rows={titulos}
          onBaixar={baixarTitulo}
          onCancelar={cancelarTitulo}
          contraparteLabel={aba === "receber" ? "Cliente" : "Fornecedor"}
        />
      )}

      {aba === "notas" && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Controle interno de nota fiscal — não emite nota fiscal real nem
            se comunica com a SEFAZ. Para emissão fiscal de verdade, integre
            um provedor (Focus NFe, eNotas etc.).
          </Alert>

          <NotaFiscalTable
            rows={notasFiscais}
            onEmitir={setNotaFiscalParaEmitir}
            onCancelar={cancelarNotaFiscal}
          />
        </>
      )}

      <TituloForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={salvarTitulo}
      />

      <BaseDialog
        open={Boolean(notaFiscalParaEmitir)}
        onClose={() => {
          setNotaFiscalParaEmitir(null);
          setNumeroControle("");
        }}
        onSave={emitirNotaFiscal}
        title="Emitir Nota Fiscal"
      >
        <BaseFormField
          label="Número de controle"
          name="numero"
          value={numeroControle}
          onChange={(event) => setNumeroControle(event.target.value)}
          required
        />
      </BaseDialog>

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

export default Financeiro;
