import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";

import BasePage from "../../../components/BasePage/BasePage";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import BaseSelect from "../../../components/BaseSelect/BaseSelect";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import TituloForm from "../../../components/TituloForm/TituloForm";
import ContaBancariaForm from "../../../components/ContaBancariaForm/ContaBancariaForm";

import tituloService from "../services/tituloService";
import notaFiscalService from "../services/notaFiscalService";
import contaBancariaService from "../services/contaBancariaService";
import fluxoCaixaService from "../services/fluxoCaixaService";

const statusLabel = {
  aberta: "Em aberto",
  paga: "Paga",
  cancelada: "Cancelada",
};

const notaFiscalStatusLabel = {
  pendente: "Pendente",
  emitida: "Emitida",
  cancelada: "Cancelada",
  processando_autorizacao: "Processando",
  autorizado: "Autorizado",
  erro_autorizacao: "Erro na autorização",
  denegado: "Denegado",
  cancelado: "Cancelado",
};

const notaFiscalStatusCor = {
  pendente: "default",
  emitida: "success",
  cancelada: "default",
  processando_autorizacao: "info",
  autorizado: "success",
  erro_autorizacao: "error",
  denegado: "error",
  cancelado: "default",
};

const notaFiscalTipoLabel = {
  saida: "Saída",
  entrada: "Entrada",
};

const CANCELADOS = ["cancelada", "cancelado"];

function NotaFiscalTable({ rows, onEmitir, onAtualizarStatus, onCancelar }) {
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
      renderCell: (params) => {
        const chip = (
          <Chip
            size="small"
            label={notaFiscalStatusLabel[params.value] || params.value}
            color={notaFiscalStatusCor[params.value] || "default"}
          />
        );

        return params.row.motivoStatus ? (
          <Tooltip title={params.row.motivoStatus}>{chip}</Tooltip>
        ) : (
          chip
        );
      },
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 280,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {params.row.status === "pendente" && (
            <Button size="small" onClick={() => onEmitir(params.row.id)}>
              Emitir
            </Button>
          )}

          {params.row.status === "processando_autorizacao" && (
            <Button
              size="small"
              onClick={() => onAtualizarStatus(params.row.id)}
            >
              Atualizar status
            </Button>
          )}

          {params.row.status === "autorizado" && (
            <>
              {params.row.xmlUrl && (
                <Link href={params.row.xmlUrl} target="_blank" rel="noopener">
                  XML
                </Link>
              )}
              {params.row.danfeUrl && (
                <Link
                  href={params.row.danfeUrl}
                  target="_blank"
                  rel="noopener"
                >
                  DANFE
                </Link>
              )}
            </>
          )}

          {!CANCELADOS.includes(params.row.status) && (
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
  );
}

function Financeiro() {
  const [aba, setAba] = useState("receber");
  const [titulos, setTitulos] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const [notasFiscais, setNotasFiscais] = useState([]);
  const [notaFiscalParaCancelar, setNotaFiscalParaCancelar] = useState(null);
  const [justificativaCancelamento, setJustificativaCancelamento] =
    useState("");

  const [contasBancarias, setContasBancarias] = useState([]);
  const [openContaForm, setOpenContaForm] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);

  const [tituloParaBaixar, setTituloParaBaixar] = useState(null);
  const [contaBaixaId, setContaBaixaId] = useState("");

  const [fluxoCaixa, setFluxoCaixa] = useState(null);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregarTitulos(tipo) {
    try {
      const dados = await tituloService.listar({ tipo });
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

  function abrirBaixarTitulo(id) {
    setTituloParaBaixar(id);
    setContaBaixaId("");
  }

  async function confirmarBaixarTitulo() {
    try {
      await tituloService.baixar(tituloParaBaixar, contaBaixaId);
      await carregarTitulos(aba);

      setTituloParaBaixar(null);
      setContaBaixaId("");

      setTipoMensagem("success");
      setMensagem("Título baixado com sucesso.");
    } catch (error) {
      console.error("Erro ao baixar título:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao baixar título.");

      throw error;
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

  async function emitirNotaFiscal(id) {
    try {
      await notaFiscalService.emitir(id);
      await carregarNotasFiscais();

      setTipoMensagem("success");
      setMensagem("Emissão iniciada. Acompanhe o status na listagem.");
    } catch (error) {
      console.error("Erro ao emitir nota fiscal:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao emitir nota fiscal.",
      );
    }
  }

  async function atualizarStatusNotaFiscal(id) {
    try {
      await notaFiscalService.atualizarStatus(id);
      await carregarNotasFiscais();

      setTipoMensagem("success");
      setMensagem("Status atualizado.");
    } catch (error) {
      console.error("Erro ao atualizar status da nota fiscal:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao atualizar status.",
      );
    }
  }

  async function cancelarNotaFiscal() {
    try {
      await notaFiscalService.cancelar(
        notaFiscalParaCancelar,
        justificativaCancelamento,
      );

      setNotaFiscalParaCancelar(null);
      setJustificativaCancelamento("");
      await carregarNotasFiscais();

      setTipoMensagem("success");
      setMensagem("Nota fiscal cancelada com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar nota fiscal:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao cancelar nota fiscal.",
      );

      throw error;
    }
  }

  async function carregarContasBancarias() {
    try {
      const dados = await contaBancariaService.listar();
      setContasBancarias(dados);
    } catch (error) {
      console.error("Erro ao carregar contas bancárias:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar contas bancárias.");
    }
  }

  async function salvarContaBancaria(dados) {
    try {
      if (contaSelecionada) {
        await contaBancariaService.atualizar(contaSelecionada.id, dados);
        setTipoMensagem("success");
        setMensagem("Conta bancária atualizada com sucesso.");
      } else {
        await contaBancariaService.criar(dados);
        setTipoMensagem("success");
        setMensagem("Conta bancária cadastrada com sucesso.");
      }

      await carregarContasBancarias();
      setContaSelecionada(null);
    } catch (error) {
      console.error("Erro ao salvar conta bancária:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao salvar conta bancária.",
      );

      throw error;
    }
  }

  async function desativarContaBancaria(id) {
    try {
      await contaBancariaService.desativar(id);
      await carregarContasBancarias();

      setTipoMensagem("success");
      setMensagem("Conta bancária desativada com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar conta bancária:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao desativar conta bancária.",
      );
    }
  }

  async function carregarFluxoCaixa() {
    try {
      const dados = await fluxoCaixaService.obter();
      setFluxoCaixa(dados);
    } catch (error) {
      console.error("Erro ao carregar fluxo de caixa:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar fluxo de caixa.");
    }
  }

  useEffect(() => {
    carregarContasBancarias();
  }, []);

  useEffect(() => {
    if (aba === "notas") {
      carregarNotasFiscais();
    } else if (aba === "contas") {
      carregarContasBancarias();
    } else if (aba === "fluxo") {
      carregarFluxoCaixa();
    } else {
      carregarTitulos(aba);
    }
  }, [aba]);

  const ehTitulos = aba === "receber" || aba === "pagar";

  const botao =
    aba === "contas"
      ? {
          label: "Nova Conta Bancária",
          onClick: () => {
            setContaSelecionada(null);
            setOpenContaForm(true);
          },
        }
      : ehTitulos
        ? { label: "Novo Título", onClick: () => setOpenForm(true) }
        : null;

  const contasColunas = [
    { field: "nome", headerName: "Nome", flex: 2 },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 1,
      valueGetter: (value) => (value === "caixa" ? "Caixa" : "Banco"),
    },
    {
      field: "saldoInicial",
      headerName: "Saldo Inicial",
      flex: 1,
      valueGetter: (value) => `R$ ${Number(value).toFixed(2)}`,
    },
    {
      field: "saldoAtual",
      headerName: "Saldo Atual",
      flex: 1,
      valueGetter: (value) => `R$ ${Number(value).toFixed(2)}`,
    },
  ];

  return (
    <BasePage
      title="Financeiro"
      subtitle="Contas a Pagar e a Receber"
      buttonLabel={botao?.label}
      onButtonClick={botao?.onClick}
    >
      <Tabs
        value={aba}
        onChange={(_event, valor) => setAba(valor)}
        sx={{ mb: 2 }}
      >
        <Tab value="receber" label="A Receber" />
        <Tab value="pagar" label="A Pagar" />
        <Tab value="notas" label="Notas Fiscais" />
        <Tab value="contas" label="Contas Bancárias" />
        <Tab value="fluxo" label="Fluxo de Caixa" />
      </Tabs>

      {ehTitulos && (
        <TituloTable
          rows={titulos}
          onBaixar={abrirBaixarTitulo}
          onCancelar={cancelarTitulo}
          contraparteLabel={aba === "receber" ? "Cliente" : "Fornecedor"}
        />
      )}

      {aba === "notas" && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Notas de saída (vendas) são emitidas de verdade via Focus NFe —
            configure o token em Empresas &gt; Integração Fiscal. Notas de
            entrada (compras) continuam como controle interno simulado.
          </Alert>

          <NotaFiscalTable
            rows={notasFiscais}
            onEmitir={emitirNotaFiscal}
            onAtualizarStatus={atualizarStatusNotaFiscal}
            onCancelar={setNotaFiscalParaCancelar}
          />
        </>
      )}

      {aba === "contas" && (
        <BaseCrudTable
          rows={contasBancarias}
          columns={contasColunas}
          onEdit={(conta) => {
            setContaSelecionada(conta);
            setOpenContaForm(true);
          }}
          onDelete={desativarContaBancaria}
        />
      )}

      {aba === "fluxo" && fluxoCaixa && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              elevation={0}
              sx={{ border: "1px solid rgba(148, 163, 184, 0.14)" }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Saldo Atual Total
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  R$ {fluxoCaixa.saldoAtualTotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {fluxoCaixa.contas.map((conta) => (
            <Grid key={conta.id} size={{ xs: 12, md: 3 }}>
              <Card
                elevation={0}
                sx={{ border: "1px solid rgba(148, 163, 184, 0.14)" }}
              >
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {conta.nome}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    R$ {Number(conta.saldoAtual).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid rgba(148, 163, 184, 0.14)",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Projeção de Saldo (próximos 30 dias)
              </Typography>

              <LineChart
                height={280}
                series={[
                  {
                    data: fluxoCaixa.projecao.map((item) => item.saldoProjetado),
                    label: "Saldo projetado",
                    color: "#3B82F6",
                    valueFormatter: (valor) => `R$ ${Number(valor).toFixed(2)}`,
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "point",
                    data: fluxoCaixa.projecao.map((item) =>
                      new Date(`${item.data}T00:00:00`).toLocaleDateString(
                        "pt-BR",
                        { day: "2-digit", month: "2-digit" },
                      ),
                    ),
                  },
                ]}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      <TituloForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={salvarTitulo}
      />

      <ContaBancariaForm
        open={openContaForm}
        conta={contaSelecionada}
        onClose={() => {
          setOpenContaForm(false);
          setContaSelecionada(null);
        }}
        onSave={salvarContaBancaria}
      />

      <BaseDialog
        open={Boolean(tituloParaBaixar)}
        onClose={() => setTituloParaBaixar(null)}
        onSave={confirmarBaixarTitulo}
        title="Baixar Título"
      >
        <BaseSelect
          label="Conta bancária / caixa"
          name="contaBaixaId"
          value={contaBaixaId}
          onChange={(event) => setContaBaixaId(event.target.value)}
          options={contasBancarias.map((conta) => ({
            value: conta.id,
            label: conta.nome,
          }))}
          required
        />
      </BaseDialog>

      <BaseDialog
        open={Boolean(notaFiscalParaCancelar)}
        onClose={() => {
          setNotaFiscalParaCancelar(null);
          setJustificativaCancelamento("");
        }}
        onSave={cancelarNotaFiscal}
        title="Cancelar Nota Fiscal"
      >
        <BaseFormField
          label="Justificativa (mínimo 15 caracteres)"
          name="justificativa"
          value={justificativaCancelamento}
          onChange={(event) =>
            setJustificativaCancelamento(event.target.value)
          }
          multiline
          minRows={3}
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
