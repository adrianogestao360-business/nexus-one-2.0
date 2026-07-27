import { useEffect, useState } from "react";
import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import BasePage from "../../../components/BasePage/BasePage";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import BaseSelect from "../../../components/BaseSelect/BaseSelect";

import auditoriaService from "../services/auditoriaService";

const acaoLabel = {
  login: "Login",
  login_falhou: "Login falhou",
  "venda.criar": "Venda criada",
  "venda.cancelar": "Venda cancelada",
  "compra.criar": "Compra criada",
  "compra.cancelar": "Compra cancelada",
  "papel.permissoes.alterar": "Permissões alteradas",
};

const acaoColor = {
  login: "success",
  login_falhou: "error",
  "venda.criar": "default",
  "venda.cancelar": "warning",
  "compra.criar": "default",
  "compra.cancelar": "warning",
  "papel.permissoes.alterar": "info",
};

const columns = [
  {
    field: "createdAt",
    headerName: "Data",
    flex: 1,
    valueGetter: (value) => new Date(value).toLocaleString("pt-BR"),
  },
  {
    field: "usuario",
    headerName: "Usuário",
    flex: 1.5,
    valueGetter: (_value, row) => row.usuario?.nome || row.usuario?.email || "-",
  },
  {
    field: "acao",
    headerName: "Ação",
    flex: 1.5,
    renderCell: (params) => (
      <Chip
        label={acaoLabel[params.value] || params.value}
        color={acaoColor[params.value] || "default"}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: "entidade",
    headerName: "Entidade",
    flex: 1,
  },
  {
    field: "entidadeId",
    headerName: "ID",
    flex: 0.6,
    valueGetter: (value) => value || "-",
  },
  {
    field: "ip",
    headerName: "IP",
    flex: 1,
    valueGetter: (value) => value || "-",
  },
];

function Auditoria() {
  const [linhas, setLinhas] = useState([]);
  const [acao, setAcao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function carregar() {
    const dados = await auditoriaService.listar({
      acao: acao || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    });
    setLinhas(dados);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BasePage title="Auditoria" subtitle="Log de ações sensíveis do sistema">
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
        <BaseSelect
          label="Ação"
          name="acao"
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
          options={[
            { value: "", label: "Todas" },
            ...Object.entries(acaoLabel).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />

        <BaseFormField
          label="Data início"
          name="dataInicio"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 200 }}
        />

        <BaseFormField
          label="Data fim"
          name="dataFim"
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 200 }}
        />

        <Button variant="contained" onClick={carregar}>
          Filtrar
        </Button>
      </Stack>

      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Mostrando os {linhas.length} evento{linhas.length === 1 ? "" : "s"} mais
        recente{linhas.length === 1 ? "" : "s"}.
      </Typography>

      <Paper
        elevation={0}
        sx={{ height: 560, borderRadius: 3, border: "1px solid rgba(148, 163, 184, 0.14)", overflow: "hidden" }}
      >
        <DataGrid
          rows={linhas}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#1B2438" },
            "& .MuiDataGrid-row:hover": { backgroundColor: "#1B2438" },
          }}
        />
      </Paper>
    </BasePage>
  );
}

export default Auditoria;
