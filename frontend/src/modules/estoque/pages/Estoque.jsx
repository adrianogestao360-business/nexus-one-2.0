import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import BasePage from "../../../components/BasePage/BasePage";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import MovimentoEstoqueForm from "../../../components/MovimentoEstoqueForm/MovimentoEstoqueForm";
import TransferenciaEstoqueForm from "../../../components/TransferenciaEstoqueForm/TransferenciaEstoqueForm";
import InventarioForm from "../../../components/InventarioForm/InventarioForm";
import BloqueioReservaForm from "../../../components/BloqueioReservaForm/BloqueioReservaForm";

import movimentoEstoqueService from "../services/movimentoEstoqueService";
import loteService from "../services/loteService";
import inventarioService from "../services/inventarioService";
import estoqueLocalizacaoService from "../services/estoqueLocalizacaoService";

const tipoMovimentoInfo = {
  entrada: { label: "Entrada", color: "success" },
  saida: { label: "Saída", color: "error" },
  bloqueio: { label: "Bloqueio", color: "warning" },
  desbloqueio: { label: "Desbloqueio", color: "info" },
  reserva: { label: "Reserva", color: "warning" },
  liberacao_reserva: { label: "Liberação de Reserva", color: "info" },
};

const origemLabel = {
  manual: "Manual",
  venda: "Venda",
  compra: "Compra",
  transferencia: "Transferência",
  devolucao: "Devolução",
  ajuste_inventario: "Ajuste de Inventário",
  avaria: "Avaria",
  perda: "Perda",
  conferencia_recebimento: "Conferência de Recebimento",
};

const acaoServico = {
  bloquear: "bloquear",
  desbloquear: "desbloquear",
  reservar: "reservar",
  liberarReserva: "liberarReserva",
};

const acaoMensagem = {
  bloquear: "Estoque bloqueado com sucesso.",
  desbloquear: "Estoque desbloqueado com sucesso.",
  reservar: "Estoque reservado com sucesso.",
  liberarReserva: "Reserva liberada com sucesso.",
};

const estoqueLocalizacaoColunas = [
  {
    field: "produto",
    headerName: "Produto",
    flex: 2,
    valueGetter: (_value, row) => row.produto?.descricao || "-",
  },
  {
    field: "localizacao",
    headerName: "Localização",
    flex: 1,
    valueGetter: (_value, row) => row.localizacao?.codigo || "-",
  },
  {
    field: "quantidade",
    headerName: "Total",
    type: "number",
    flex: 1,
  },
  {
    field: "quantidadeBloqueada",
    headerName: "Bloqueado",
    type: "number",
    flex: 1,
  },
  {
    field: "quantidadeReservada",
    headerName: "Reservado",
    type: "number",
    flex: 1,
  },
  {
    field: "disponivel",
    headerName: "Disponível",
    flex: 1,
    valueGetter: (_value, row) =>
      row.quantidade - row.quantidadeBloqueada - row.quantidadeReservada,
  },
];

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
    renderCell: (params) => {
      const info = tipoMovimentoInfo[params.value] || {
        label: params.value,
        color: "default",
      };

      return (
        <Chip
          label={info.label}
          color={info.color}
          size="small"
          variant="outlined"
        />
      );
    },
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
    field: "lote",
    headerName: "Lote",
    flex: 1,
    valueGetter: (_value, row) => row.lote?.numero || "-",
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

const vencimentoStatus = (dataValidade) => {
  if (!dataValidade) {
    return null;
  }

  const hojeUTC = Date.UTC(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  const validade = new Date(dataValidade);
  const validadeUTC = Date.UTC(
    validade.getUTCFullYear(),
    validade.getUTCMonth(),
    validade.getUTCDate(),
  );

  const diffDias = Math.round((validadeUTC - hojeUTC) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    return { label: "Vencido", color: "error" };
  }

  if (diffDias <= 7) {
    return { label: "Vencendo", color: "warning" };
  }

  return { label: "OK", color: "success" };
};

const lotesColunas = [
  {
    field: "produto",
    headerName: "Produto",
    flex: 2,
    valueGetter: (_value, row) => row.produto?.descricao || "-",
  },
  { field: "numero", headerName: "Lote", flex: 1 },
  {
    field: "quantidade",
    headerName: "Quantidade",
    type: "number",
    flex: 1,
  },
  {
    field: "dataValidade",
    headerName: "Validade",
    flex: 1,
    valueGetter: (value) =>
      value
        ? new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" })
        : "-",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    renderCell: (params) => {
      const status = vencimentoStatus(params.row.dataValidade);

      if (!status) {
        return "-";
      }

      return (
        <Chip
          label={status.label}
          color={status.color}
          size="small"
          variant="outlined"
        />
      );
    },
  },
];

const inventarioTipoLabel = {
  geral: "Geral",
  rotativo: "Rotativo",
};

const inventarioStatusLabel = {
  aberto: "Aberto",
  fechado: "Fechado",
};

const inventarioColunas = [
  {
    field: "tipo",
    headerName: "Tipo",
    flex: 1,
    valueGetter: (value) => inventarioTipoLabel[value] || value,
  },
  {
    field: "escopo",
    headerName: "Escopo",
    flex: 2,
    valueGetter: (_value, row) =>
      row.localizacao?.codigo ||
      row.produto?.descricao ||
      "Todo o estoque",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    renderCell: (params) => (
      <Chip
        label={inventarioStatusLabel[params.value] || params.value}
        color={params.value === "aberto" ? "warning" : "success"}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: "createdAt",
    headerName: "Aberto em",
    flex: 1,
    valueGetter: (value) => new Date(value).toLocaleString("pt-BR"),
  },
  {
    field: "itens",
    headerName: "Itens",
    flex: 1,
    valueGetter: (_value, row) => row._count?.itens ?? 0,
  },
];

function Estoque() {
  const [aba, setAba] = useState("movimentos");
  const [rows, setRows] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openTransferencia, setOpenTransferencia] = useState(false);
  const [openInventarioForm, setOpenInventarioForm] = useState(false);
  const [inventarioDetalhe, setInventarioDetalhe] = useState(null);
  const [contagens, setContagens] = useState({});
  const [estoquesLocalizacao, setEstoquesLocalizacao] = useState([]);
  const [openBloqueioReservaForm, setOpenBloqueioReservaForm] = useState(false);
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

  async function carregarLotes() {
    try {
      const dados = await loteService.listar();
      setLotes(dados);
    } catch (error) {
      console.error("Erro ao carregar lotes:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar lotes.");
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

  async function carregarEstoquesLocalizacao() {
    try {
      const dados = await estoqueLocalizacaoService.listar();
      setEstoquesLocalizacao(dados);
    } catch (error) {
      console.error("Erro ao carregar estoque por localização:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar estoque por localização.");
    }
  }

  async function salvarBloqueioReserva(acao, dados) {
    try {
      await movimentoEstoqueService[acaoServico[acao]](dados);
      await carregarEstoquesLocalizacao();

      setTipoMensagem("success");
      setMensagem(acaoMensagem[acao]);
    } catch (error) {
      console.error("Erro ao registrar bloqueio/reserva:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao registrar operação.",
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

  async function carregarInventarios() {
    try {
      const dados = await inventarioService.listar();
      setInventarios(dados);
    } catch (error) {
      console.error("Erro ao carregar inventários:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar inventários.");
    }
  }

  async function abrirInventario(dados) {
    try {
      await inventarioService.abrir(dados);
      await carregarInventarios();

      setTipoMensagem("success");
      setMensagem("Inventário aberto com sucesso.");
    } catch (error) {
      console.error("Erro ao abrir inventário:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao abrir inventário.",
      );

      throw error;
    }
  }

  async function abrirDetalheInventario(inventario) {
    try {
      const detalhe = await inventarioService.buscarPorId(inventario.id);
      setInventarioDetalhe(detalhe);
      setContagens({});
    } catch (error) {
      console.error("Erro ao carregar inventário:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar inventário.");
    }
  }

  async function salvarContagem(itemId) {
    try {
      await inventarioService.registrarContagem(
        inventarioDetalhe.id,
        itemId,
        contagens[itemId],
      );

      const detalhe = await inventarioService.buscarPorId(
        inventarioDetalhe.id,
      );
      setInventarioDetalhe(detalhe);

      setTipoMensagem("success");
      setMensagem("Contagem registrada.");
    } catch (error) {
      console.error("Erro ao registrar contagem:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao registrar contagem.",
      );
    }
  }

  async function fecharInventario() {
    try {
      const detalhe = await inventarioService.fechar(inventarioDetalhe.id);
      setInventarioDetalhe(detalhe);
      await carregarInventarios();

      setTipoMensagem("success");
      setMensagem("Inventário fechado. Ajustes de estoque aplicados.");
    } catch (error) {
      console.error("Erro ao fechar inventário:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao fechar inventário.",
      );
    }
  }

  useEffect(() => {
    if (aba === "lotes") {
      carregarLotes();
    } else if (aba === "inventario") {
      carregarInventarios();
    } else if (aba === "bloqueioReserva") {
      carregarEstoquesLocalizacao();
    } else {
      carregarMovimentos();
    }
  }, [aba]);

  const botaoAba = {
    movimentos: { label: "Novo Movimento", onClick: () => setOpenForm(true) },
    inventario: {
      label: "Novo Inventário",
      onClick: () => setOpenInventarioForm(true),
    },
    bloqueioReserva: {
      label: "Bloquear / Reservar",
      onClick: () => setOpenBloqueioReservaForm(true),
    },
  };

  return (
    <BasePage
      title="Estoque"
      subtitle="Kardex de Movimentações"
      buttonLabel={botaoAba[aba]?.label}
      onButtonClick={botaoAba[aba]?.onClick}
    >
      <Tabs
        value={aba}
        onChange={(_event, valor) => setAba(valor)}
        sx={{ mb: 2 }}
      >
        <Tab value="movimentos" label="Movimentações" />
        <Tab value="lotes" label="Lotes e Validades" />
        <Tab value="inventario" label="Inventário" />
        <Tab value="bloqueioReserva" label="Bloqueio e Reserva" />
      </Tabs>

      {aba === "movimentos" && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SwapHorizIcon />}
            onClick={() => setOpenTransferencia(true)}
          >
            Transferir Estoque
          </Button>
        </Stack>
      )}

      {aba === "movimentos" && (
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
      )}

      {aba === "lotes" && (
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
            rows={lotes}
            columns={lotesColunas}
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
      )}

      {aba === "inventario" && (
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
            rows={inventarios}
            columns={inventarioColunas}
            disableRowSelectionOnClick
            onRowClick={(params) => abrirDetalheInventario(params.row)}
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
              cursor: "pointer",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#1B2438",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#1B2438",
              },
            }}
          />
        </Paper>
      )}

      {aba === "bloqueioReserva" && (
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
            rows={estoquesLocalizacao}
            columns={estoqueLocalizacaoColunas}
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
      )}

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

      <InventarioForm
        open={openInventarioForm}
        onClose={() => setOpenInventarioForm(false)}
        onSave={abrirInventario}
      />

      <BloqueioReservaForm
        open={openBloqueioReservaForm}
        onClose={() => setOpenBloqueioReservaForm(false)}
        onSave={salvarBloqueioReserva}
      />

      <BaseDialog
        open={Boolean(inventarioDetalhe)}
        onClose={() => setInventarioDetalhe(null)}
        title={`Inventário #${inventarioDetalhe?.id || ""} — ${
          inventarioTipoLabel[inventarioDetalhe?.tipo] || ""
        } (${inventarioStatusLabel[inventarioDetalhe?.status] || ""})`}
        hideSave
      >
        {inventarioDetalhe && (
          <Stack spacing={2}>
            {inventarioDetalhe.itens.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                }}
              >
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <strong>{item.produto?.descricao}</strong>
                  <span>
                    {item.localizacao?.codigo} — Sistema: {item.quantidadeSistema}
                    {item.quantidadeContada !== null
                      ? ` | Contado: ${item.quantidadeContada}`
                      : ""}
                  </span>
                </Stack>

                {inventarioDetalhe.status === "aberto" && (
                  <>
                    <BaseFormField
                      label="Quantidade contada"
                      name={`contagem-${item.id}`}
                      type="number"
                      value={
                        contagens[item.id] ?? item.quantidadeContada ?? ""
                      }
                      onChange={(event) =>
                        setContagens((old) => ({
                          ...old,
                          [item.id]: event.target.value,
                        }))
                      }
                      sx={{ width: 180, flexShrink: 0 }}
                    />

                    <Button
                      variant="outlined"
                      onClick={() => salvarContagem(item.id)}
                      sx={{ flexShrink: 0 }}
                    >
                      Salvar
                    </Button>
                  </>
                )}
              </Stack>
            ))}

            {inventarioDetalhe.status === "aberto" && (
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={fecharInventario}>
                  Fechar Inventário
                </Button>
              </Stack>
            )}
          </Stack>
        )}
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

export default Estoque;
