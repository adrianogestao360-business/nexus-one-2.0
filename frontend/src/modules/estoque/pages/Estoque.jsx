import { useEffect, useState } from "react";
import { Alert, Chip, Paper, Snackbar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import BasePage from "../../../components/BasePage/BasePage";
import MovimentoEstoqueForm from "../../../components/MovimentoEstoqueForm/MovimentoEstoqueForm";

import movimentoEstoqueService from "../services/movimentoEstoqueService";

const origemLabel = {
  manual: "Manual",
  venda: "Venda",
  compra: "Compra",
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
      <Paper
        elevation={0}
        sx={{
          height: 620,
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

      <MovimentoEstoqueForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={salvarMovimento}
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
