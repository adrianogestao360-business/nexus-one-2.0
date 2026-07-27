import { useEffect, useState } from "react";
import { Alert, Button, Chip, Paper, Snackbar, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import BasePage from "../../../components/BasePage/BasePage";
import MovimentoEstoqueForm from "../../../components/MovimentoEstoqueForm/MovimentoEstoqueForm";
import TransferenciaEstoqueForm from "../../../components/TransferenciaEstoqueForm/TransferenciaEstoqueForm";

import movimentoEstoqueService from "../services/movimentoEstoqueService";

const origemLabel = {
  manual: "Manual",
  venda: "Venda",
  compra: "Compra",
  transferencia: "Transferência",
};

const columns = [
  {
    field: "createdAt",
    headerName: "Data",
    flex: 1,
    valueGetter: (value) => new Date(value).toLocaleString("pt-BR"),
  },
  {
    field: "produto",
    headerName: "Produto",
    flex: 2,
    valueGetter: (_value, row) => row.produto?.descricao || "-",
  },
  {
    field: "tipo",
    headerName: "Tipo",
    flex: 1,
    renderCell: (params) => (
      <Chip
        label={params.value === "entrada" ? "Entrada" : "Saída"}
        color={params.value === "entrada" ? "success" : "error"}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: "quantidade",
    headerName: "Quantidade",
    type: "number",
    flex: 1,
  },
  {
    field: "saldoApos",
    headerName: "Saldo Após",
    type: "number",
    flex: 1,
  },
  {
    field: "localizacao",
    headerName: "Localização",
    flex: 1,
    valueGetter: (_value, row) => row.localizacao?.codigo || "-",
  },
  {
    field: "motivo",
    headerName: "Motivo",
    flex: 2,
  },
  {
    field: "origem",
    headerName: "Origem",
    flex: 1,
    valueGetter: (value) => origemLabel[value] || value,
  },
];

function Estoque() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openTransferencia, setOpenTransferencia] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregarMovimentos() {
    try {
      const movimentos = await movimentoEstoqueService.listar();
      setRows(movimentos);
    } catch (error) {
      console.error("Erro ao carregar movimentos de estoque:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar movimentos de estoque.");
    }
  }

  async function salvarMovimento(dados) {
    try {
      await movimentoEstoqueService.criar(dados);
      await carregarMovimentos();

      setOpenForm(false);
      setTipoMensagem("success");
      setMensagem("Movimento lançado com sucesso.");
    } catch (error) {
      console.error("Erro ao lançar movimento:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao lançar movimento.",
      );

      throw error;
    }
  }

  async function salvarTransferencia(dados) {
    try {
      await movimentoEstoqueService.transferir(dados);
      await carregarMovimentos();

      setOpenTransferencia(false);
      setTipoMensagem("success");
      setMensagem("Transferência realizada com sucesso.");
    } catch (error) {
      console.error("Erro ao transferir estoque:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao transferir estoque.",
      );

      throw error;
    }
  }

  useEffect(() => {
    carregarMovimentos();
  }, []);

  return (
    <BasePage
      title="Estoque"
      subtitle="Kardex de Movimentações"
      buttonLabel="Novo Movimento"
      onButtonClick={() => setOpenForm(true)}
    >
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<SwapHorizIcon />}
          onClick={() => setOpenTransferencia(true)}
        >
          Transferir Estoque
        </Button>
      </Stack>

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
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1B2438",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#1B2438",
            },
          }}
        />
      </Paper>

      <MovimentoEstoqueForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={salvarMovimento}
      />

      <TransferenciaEstoqueForm
        open={openTransferencia}
        onClose={() => setOpenTransferencia(false)}
        onSave={salvarTransferencia}
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

export default Estoque;
