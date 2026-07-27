import { useState } from "react";
import {
  Alert,
  Button,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";

import BasePage from "../../../components/BasePage/BasePage";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import BaseSelect from "../../../components/BaseSelect/BaseSelect";

import vendaService from "../../vendas/services/vendaService";
import tituloService from "../../financeiro/services/tituloService";
import produtoService from "../../produtos/services/produtoService";
import dreService from "../services/dreService";

import { exportarCsv } from "../../../utils/csv";

const dataGridSx = {
  border: 0,
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#1B2438",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#1B2438",
  },
};

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2)}`;
}

function VendasReport({ onErro }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("");
  const [linhas, setLinhas] = useState([]);
  const [buscou, setBuscou] = useState(false);

  async function filtrar() {
    try {
      const dados = await vendaService.listar({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        status: status || undefined,
      });
      setLinhas(dados);
      setBuscou(true);
    } catch {
      onErro("Erro ao filtrar vendas.");
    }
  }

  function exportar() {
    exportarCsv(
      "relatorio-vendas.csv",
      [
        { label: "Venda", valor: (l) => `#${l.id}` },
        { label: "Cliente", valor: (l) => l.cliente?.nome || "-" },
        { label: "Status", valor: (l) => l.status },
        { label: "Total", valor: (l) => Number(l.total).toFixed(2) },
        {
          label: "Data",
          valor: (l) => new Date(l.createdAt).toLocaleDateString("pt-BR"),
        },
      ],
      linhas,
    );
  }

  const totalGeral = linhas.reduce((soma, l) => soma + Number(l.total), 0);

  const columns = [
    { field: "id", headerName: "Venda", flex: 1, valueGetter: (v) => `#${v}` },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 2,
      valueGetter: (_v, row) => row.cliente?.nome || "-",
    },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      valueGetter: (v) => formatarMoeda(v),
    },
    {
      field: "createdAt",
      headerName: "Data",
      flex: 1,
      valueGetter: (v) => new Date(v).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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

        <BaseSelect
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "", label: "Todos" },
            { value: "confirmada", label: "Confirmada" },
            { value: "cancelada", label: "Cancelada" },
          ]}
        />

        <Button variant="contained" onClick={filtrar}>
          Filtrar
        </Button>

        <Button
          startIcon={<DownloadIcon />}
          onClick={exportar}
          disabled={linhas.length === 0}
        >
          Exportar CSV
        </Button>
      </Stack>

      {buscou && (
        <Typography color="text.secondary">
          {linhas.length} venda(s) — Total: {formatarMoeda(totalGeral)}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{ height: 480, borderRadius: 3, border: "1px solid rgba(148, 163, 184, 0.14)", overflow: "hidden" }}
      >
        <DataGrid
          rows={linhas}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={dataGridSx}
        />
      </Paper>
    </Stack>
  );
}

function FinanceiroReport({ onErro }) {
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [linhas, setLinhas] = useState([]);
  const [buscou, setBuscou] = useState(false);

  async function filtrar() {
    try {
      const dados = await tituloService.listar({
        tipo: tipo || undefined,
        status: status || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });
      setLinhas(dados);
      setBuscou(true);
    } catch {
      onErro("Erro ao filtrar títulos.");
    }
  }

  function exportar() {
    exportarCsv(
      "relatorio-financeiro.csv",
      [
        { label: "Descrição", valor: (l) => l.descricao },
        { label: "Tipo", valor: (l) => (l.tipo === "pagar" ? "A Pagar" : "A Receber") },
        {
          label: "Cliente/Fornecedor",
          valor: (l) => l.cliente?.nome || l.fornecedor?.nome || "-",
        },
        { label: "Valor", valor: (l) => Number(l.valor).toFixed(2) },
        {
          label: "Vencimento",
          valor: (l) => new Date(l.vencimento).toLocaleDateString("pt-BR"),
        },
        { label: "Status", valor: (l) => l.status },
      ],
      linhas,
    );
  }

  const totalGeral = linhas.reduce((soma, l) => soma + Number(l.valor), 0);

  const columns = [
    { field: "descricao", headerName: "Descrição", flex: 2 },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      valueGetter: (v) => (v === "pagar" ? "A Pagar" : "A Receber"),
    },
    {
      field: "contraparte",
      headerName: "Cliente/Fornecedor",
      flex: 2,
      valueGetter: (_v, row) => row.cliente?.nome || row.fornecedor?.nome || "-",
    },
    {
      field: "valor",
      headerName: "Valor",
      flex: 1,
      valueGetter: (v) => formatarMoeda(v),
    },
    {
      field: "vencimento",
      headerName: "Vencimento",
      flex: 1,
      valueGetter: (v) => new Date(v).toLocaleDateString("pt-BR"),
    },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <BaseSelect
          label="Tipo"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          options={[
            { value: "", label: "Todos" },
            { value: "pagar", label: "A Pagar" },
            { value: "receber", label: "A Receber" },
          ]}
        />

        <BaseSelect
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "", label: "Todos" },
            { value: "aberta", label: "Em aberto" },
            { value: "paga", label: "Paga" },
            { value: "cancelada", label: "Cancelada" },
          ]}
        />

        <BaseFormField
          label="Vencimento de"
          name="dataInicio"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 200 }}
        />

        <BaseFormField
          label="Vencimento até"
          name="dataFim"
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 200 }}
        />

        <Button variant="contained" onClick={filtrar}>
          Filtrar
        </Button>

        <Button
          startIcon={<DownloadIcon />}
          onClick={exportar}
          disabled={linhas.length === 0}
        >
          Exportar CSV
        </Button>
      </Stack>

      {buscou && (
        <Typography color="text.secondary">
          {linhas.length} título(s) — Total: {formatarMoeda(totalGeral)}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{ height: 480, borderRadius: 3, border: "1px solid rgba(148, 163, 184, 0.14)", overflow: "hidden" }}
      >
        <DataGrid
          rows={linhas}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={dataGridSx}
        />
      </Paper>
    </Stack>
  );
}

function EstoqueReport({ onErro }) {
  const [linhas, setLinhas] = useState([]);
  const [buscou, setBuscou] = useState(false);

  async function carregar() {
    try {
      const dados = await produtoService.listar();
      setLinhas(dados.filter((p) => p.ativo));
      setBuscou(true);
    } catch {
      onErro("Erro ao carregar estoque.");
    }
  }

  function exportar() {
    exportarCsv(
      "relatorio-estoque.csv",
      [
        { label: "Código", valor: (l) => l.codigo },
        { label: "Descrição", valor: (l) => l.descricao },
        { label: "Categoria", valor: (l) => l.categoria || "-" },
        { label: "Estoque", valor: (l) => l.estoque },
        { label: "Preço unitário", valor: (l) => Number(l.preco).toFixed(2) },
        {
          label: "Valor em estoque",
          valor: (l) => (Number(l.preco) * l.estoque).toFixed(2),
        },
      ],
      linhas,
    );
  }

  const valorTotal = linhas.reduce(
    (soma, l) => soma + Number(l.preco) * l.estoque,
    0,
  );

  const columns = [
    { field: "codigo", headerName: "Código", flex: 1 },
    { field: "descricao", headerName: "Descrição", flex: 2 },
    {
      field: "categoria",
      headerName: "Categoria",
      flex: 1,
      valueGetter: (v) => v || "-",
    },
    { field: "estoque", headerName: "Estoque", flex: 1, type: "number" },
    {
      field: "preco",
      headerName: "Preço unitário",
      flex: 1,
      valueGetter: (v) => formatarMoeda(v),
    },
    {
      field: "valorEstoque",
      headerName: "Valor em estoque",
      flex: 1,
      valueGetter: (_v, row) => formatarMoeda(Number(row.preco) * row.estoque),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" onClick={carregar}>
          Carregar posição atual
        </Button>

        <Button
          startIcon={<DownloadIcon />}
          onClick={exportar}
          disabled={linhas.length === 0}
        >
          Exportar CSV
        </Button>
      </Stack>

      {buscou && (
        <Typography color="text.secondary">
          {linhas.length} produto(s) — Valor total em estoque:{" "}
          {formatarMoeda(valorTotal)}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{ height: 480, borderRadius: 3, border: "1px solid rgba(148, 163, 184, 0.14)", overflow: "hidden" }}
      >
        <DataGrid
          rows={linhas}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={dataGridSx}
        />
      </Paper>
    </Stack>
  );
}

function DreReport({ onErro }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dre, setDre] = useState(null);

  async function filtrar() {
    try {
      const dados = await dreService.gerar({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });
      setDre(dados);
    } catch {
      onErro("Erro ao gerar DRE.");
    }
  }

  function exportar() {
    exportarCsv(
      "dre.csv",
      [
        { label: "Item", valor: (l) => l.item },
        { label: "Valor", valor: (l) => l.valor.toFixed(2) },
      ],
      [
        { item: "Receita Bruta de Vendas", valor: dre.receitaBruta },
        { item: "(-) Custo das Mercadorias", valor: -dre.custoMercadorias },
        { item: "(=) Lucro Bruto", valor: dre.lucroBruto },
        { item: "(-) Despesas com Pessoal", valor: -dre.despesasPessoal },
        {
          item: "(-) Outras Despesas Operacionais",
          valor: -dre.outrasDespesasOperacionais,
        },
        { item: "(=) Lucro Líquido", valor: dre.lucroLiquido },
      ],
    );
  }

  const linhas = dre && [
    { label: "Receita Bruta de Vendas", valor: dre.receitaBruta },
    { label: "(-) Custo das Mercadorias", valor: -dre.custoMercadorias },
    {
      label: "(=) Lucro Bruto",
      valor: dre.lucroBruto,
      destaque: true,
    },
    { label: "(-) Despesas com Pessoal", valor: -dre.despesasPessoal },
    {
      label: "(-) Outras Despesas Operacionais",
      valor: -dre.outrasDespesasOperacionais,
    },
    {
      label: "(=) Lucro Líquido",
      valor: dre.lucroLiquido,
      destaque: true,
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
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

        <Button variant="contained" onClick={filtrar}>
          Gerar DRE
        </Button>

        <Button
          startIcon={<DownloadIcon />}
          onClick={exportar}
          disabled={!dre}
        >
          Exportar CSV
        </Button>
      </Stack>

      {!dre && (
        <Typography color="text.secondary">
          Selecione um período (ou deixe em branco para todo o histórico) e
          clique em "Gerar DRE".
        </Typography>
      )}

      {dre && (
        <Paper
          elevation={0}
          sx={{
            maxWidth: 560,
            borderRadius: 3,
            border: "1px solid rgba(148, 163, 184, 0.14)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableBody>
              {linhas.map((linha) => (
                <TableRow key={linha.label}>
                  <TableCell
                    sx={{ fontWeight: linha.destaque ? 700 : 400 }}
                  >
                    {linha.label}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: linha.destaque ? 700 : 400,
                      color:
                        linha.valor < 0
                          ? "error.main"
                          : linha.destaque
                            ? "success.main"
                            : "text.primary",
                    }}
                  >
                    {formatarMoeda(linha.valor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}

function Relatorios() {
  const [aba, setAba] = useState("vendas");
  const [mensagem, setMensagem] = useState("");

  return (
    <BasePage title="Relatórios" subtitle="Vendas, Financeiro, Estoque e DRE">
      <Tabs value={aba} onChange={(_e, v) => setAba(v)} sx={{ mb: 2 }}>
        <Tab value="vendas" label="Vendas" />
        <Tab value="financeiro" label="Financeiro" />
        <Tab value="estoque" label="Estoque" />
        <Tab value="dre" label="DRE" />
      </Tabs>

      {aba === "vendas" && <VendasReport onErro={setMensagem} />}
      {aba === "financeiro" && <FinanceiroReport onErro={setMensagem} />}
      {aba === "estoque" && <EstoqueReport onErro={setMensagem} />}
      {aba === "dre" && <DreReport onErro={setMensagem} />}

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={5000}
        onClose={() => setMensagem("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setMensagem("")}>
          {mensagem}
        </Alert>
      </Snackbar>
    </BasePage>
  );
}

export default Relatorios;
