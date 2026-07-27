import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LinkIcon from "@mui/icons-material/Link";
import MapIcon from "@mui/icons-material/Map";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import VeiculoForm from "../../../components/VeiculoForm/VeiculoForm";
import MotoristaForm from "../../../components/MotoristaForm/MotoristaForm";
import AbastecimentoForm from "../../../components/AbastecimentoForm/AbastecimentoForm";
import NovaRotaForm from "../../../components/NovaRotaForm/NovaRotaForm";
import MapaRota from "../../../components/MapaRota/MapaRota";

import veiculoService from "../services/veiculoService";
import motoristaService from "../services/motoristaService";
import entregaService from "../services/entregaService";
import rotaService from "../services/rotaService";
import abastecimentoService from "../services/abastecimentoService";

const colunasMotoristas = [
  { field: "nome", headerName: "Nome", flex: 2 },
  { field: "cnh", headerName: "CNH", flex: 1 },
  { field: "telefone", headerName: "Telefone", flex: 1 },
];

const entregaStatusLabel = {
  em_rota: "Em rota",
  entregue: "Entregue",
};

function VeiculoTable({ rows, onEdit, onDelete, onAbastecer }) {
  const colunas = [
    { field: "placa", headerName: "Placa", flex: 1 },
    { field: "modelo", headerName: "Modelo", flex: 2 },
    { field: "capacidade", headerName: "Capacidade", flex: 1 },
    {
      field: "kmMedioPorLitro",
      headerName: "Km/l",
      flex: 1,
      valueGetter: (value) => (value ? `${value} km/l` : "-"),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onAbastecer(params.row)}
            title="Lançar abastecimento"
          >
            <LocalGasStationIcon fontSize="small" />
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
      sx={{ height: 480, borderRadius: 3, border: "1px solid #E5E7EB", overflow: "hidden" }}
    >
      <DataGrid
        rows={rows}
        columns={colunas}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#F8FAFC" },
          "& .MuiDataGrid-row:hover": { backgroundColor: "#F8FAFC" },
        }}
      />
    </Paper>
  );
}

function EntregaTable({ rows, onConfirmar }) {
  const colunas = [
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 2,
      valueGetter: (_value, row) =>
        row.separacao?.venda?.cliente?.nome || "-",
    },
    {
      field: "veiculo",
      headerName: "Veículo",
      flex: 1,
      valueGetter: (_value, row) => row.veiculo?.placa || "-",
    },
    {
      field: "motorista",
      headerName: "Motorista",
      flex: 1,
      valueGetter: (_value, row) => row.motorista?.nome || "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueGetter: (value) => entregaStatusLabel[value] || value,
    },
    {
      field: "dataSaida",
      headerName: "Saída",
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleString("pt-BR"),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.status === "em_rota" && (
          <Button size="small" onClick={() => onConfirmar(params.row.id)}>
            Confirmar Entrega
          </Button>
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
        columns={colunas}
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

function RotaCard({ rota, onCopiarLink, onVerNoMapa }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2, borderRadius: 3, border: "1px solid #E5E7EB" }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        spacing={1}
      >
        <Box>
          <Typography fontWeight={700}>
            {rota.veiculo?.placa} — {rota.motorista?.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {rota.entregas.length} entrega(s) —{" "}
            {rota.status === "concluida" ? "Concluída" : "Em andamento"}
            {rota.kmPercorrido != null &&
              ` — ${Number(rota.kmPercorrido).toFixed(2)} km`}
            {rota.custoEstimado != null &&
              ` — custo estimado R$ ${Number(rota.custoEstimado).toFixed(2)}`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {rota.status === "em_andamento" && (
            <Button
              size="small"
              startIcon={<LinkIcon />}
              onClick={() => onCopiarLink(rota)}
            >
              Copiar link de rastreio
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            startIcon={<MapIcon />}
            onClick={() => onVerNoMapa(rota)}
          >
            Ver no mapa
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
        {rota.entregas.map((entrega) => (
          <Avatar
            key={entrega.id}
            title={entrega.separacao?.venda?.cliente?.nome || "Cliente"}
            sx={{
              bgcolor: entrega.status === "entregue" ? "#16A34A" : "#94A3B8",
              width: 34,
              height: 34,
            }}
          >
            <LocalShippingIcon fontSize="small" />
          </Avatar>
        ))}
      </Stack>
    </Paper>
  );
}

function Transportes() {
  const [aba, setAba] = useState("veiculos");

  const [veiculos, setVeiculos] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const [openVeiculoForm, setOpenVeiculoForm] = useState(false);

  const [motoristas, setMotoristas] = useState([]);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [openMotoristaForm, setOpenMotoristaForm] = useState(false);

  const [entregas, setEntregas] = useState([]);

  const [rotas, setRotas] = useState([]);
  const [openNovaRota, setOpenNovaRota] = useState(false);
  const [rotaNoMapa, setRotaNoMapa] = useState(null);

  const [veiculoParaAbastecer, setVeiculoParaAbastecer] = useState(null);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const pollingRef = useRef(null);

  async function carregarVeiculos() {
    try {
      const dados = await veiculoService.listar();
      setVeiculos(dados);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar veículos.");
    }
  }

  async function carregarMotoristas() {
    try {
      const dados = await motoristaService.listar();
      setMotoristas(dados);
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar motoristas.");
    }
  }

  async function carregarEntregas() {
    try {
      const dados = await entregaService.listar();
      setEntregas(dados);
    } catch (error) {
      console.error("Erro ao carregar entregas:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar entregas.");
    }
  }

  async function carregarRotas() {
    try {
      const dados = await rotaService.listar();
      setRotas(dados);
    } catch (error) {
      console.error("Erro ao carregar rotas:", error);
    }
  }

  useEffect(() => {
    carregarVeiculos();
    carregarMotoristas();
    carregarEntregas();
    carregarRotas();
  }, []);

  useEffect(() => {
    if (aba === "rotas") {
      carregarRotas();
      pollingRef.current = setInterval(carregarRotas, 15000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [aba]);

  async function confirmarEntrega(id) {
    try {
      await entregaService.confirmar(id);
      await carregarEntregas();

      setTipoMensagem("success");
      setMensagem("Entrega confirmada com sucesso.");
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao confirmar entrega.",
      );
    }
  }

  async function salvarVeiculo(dados) {
    try {
      if (veiculoSelecionado) {
        await veiculoService.atualizar(veiculoSelecionado.id, dados);
        setMensagem("Veículo atualizado com sucesso.");
      } else {
        await veiculoService.criar(dados);
        setMensagem("Veículo cadastrado com sucesso.");
      }

      await carregarVeiculos();

      setVeiculoSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao salvar veículo.");

      throw error;
    }
  }

  async function desativarVeiculo(id) {
    try {
      await veiculoService.desativar(id);
      await carregarVeiculos();

      setTipoMensagem("success");
      setMensagem("Veículo desativado com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar veículo:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao desativar veículo.");
    }
  }

  async function salvarAbastecimento(dados) {
    try {
      await abastecimentoService.criar(veiculoParaAbastecer.id, dados);

      setVeiculoParaAbastecer(null);
      setTipoMensagem("success");
      setMensagem("Abastecimento lançado com sucesso.");
    } catch (error) {
      console.error("Erro ao lançar abastecimento:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao lançar abastecimento.",
      );

      throw error;
    }
  }

  async function salvarMotorista(dados) {
    try {
      if (motoristaSelecionado) {
        await motoristaService.atualizar(motoristaSelecionado.id, dados);
        setMensagem("Motorista atualizado com sucesso.");
      } else {
        await motoristaService.criar(dados);
        setMensagem("Motorista cadastrado com sucesso.");
      }

      await carregarMotoristas();

      setMotoristaSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao salvar motorista.");

      throw error;
    }
  }

  async function desativarMotorista(id) {
    try {
      await motoristaService.desativar(id);
      await carregarMotoristas();

      setTipoMensagem("success");
      setMensagem("Motorista desativado com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar motorista:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao desativar motorista.");
    }
  }

  async function salvarNovaRota(dados) {
    try {
      await rotaService.criar(dados);
      await carregarRotas();

      setOpenNovaRota(false);
      setTipoMensagem("success");
      setMensagem("Rota despachada com sucesso.");
    } catch (error) {
      console.error("Erro ao criar rota:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao criar rota.");

      throw error;
    }
  }

  function copiarLinkRastreio(rota) {
    const link = `${window.location.origin}/rastreio/${rota.tokenRastreio}`;
    navigator.clipboard?.writeText(link);

    setTipoMensagem("success");
    setMensagem("Link de rastreio copiado para a área de transferência.");
  }

  async function abrirMapa(rota) {
    try {
      const detalhe = await rotaService.buscarPorId(rota.id);
      setRotaNoMapa(detalhe);
    } catch (error) {
      console.error("Erro ao carregar detalhe da rota:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar detalhe da rota.");
    }
  }

  const ehVeiculos = aba === "veiculos";
  const ehMotoristas = aba === "motoristas";
  const ehRotas = aba === "rotas";

  return (
    <BasePage
      title="Frota"
      subtitle="Veículos, Motoristas e Rotas"
      buttonLabel={
        ehVeiculos
          ? "Novo Veículo"
          : ehMotoristas
            ? "Novo Motorista"
            : ehRotas
              ? "Nova Rota"
              : undefined
      }
      onButtonClick={() => {
        if (ehVeiculos) {
          setVeiculoSelecionado(null);
          setOpenVeiculoForm(true);
        } else if (ehMotoristas) {
          setMotoristaSelecionado(null);
          setOpenMotoristaForm(true);
        } else if (ehRotas) {
          setOpenNovaRota(true);
        }
      }}
    >
      <Tabs
        value={aba}
        onChange={(_event, valor) => setAba(valor)}
        sx={{ mb: 2 }}
      >
        <Tab value="veiculos" label="Veículos" />
        <Tab value="motoristas" label="Motoristas" />
        <Tab value="entregas" label="Entregas" />
        <Tab value="rotas" label="Rotas" />
      </Tabs>

      {ehVeiculos && (
        <VeiculoTable
          rows={veiculos}
          onEdit={(veiculo) => {
            setVeiculoSelecionado(veiculo);
            setOpenVeiculoForm(true);
          }}
          onDelete={desativarVeiculo}
          onAbastecer={setVeiculoParaAbastecer}
        />
      )}

      {ehMotoristas && (
        <BaseCrudTable
          rows={motoristas}
          columns={colunasMotoristas}
          onEdit={(motorista) => {
            setMotoristaSelecionado(motorista);
            setOpenMotoristaForm(true);
          }}
          onDelete={desativarMotorista}
        />
      )}

      {aba === "entregas" && (
        <EntregaTable rows={entregas} onConfirmar={confirmarEntrega} />
      )}

      {ehRotas && (
        <Stack spacing={2}>
          {rotas.map((rota) => (
            <RotaCard
              key={rota.id}
              rota={rota}
              onCopiarLink={copiarLinkRastreio}
              onVerNoMapa={abrirMapa}
            />
          ))}

          {rotas.length === 0 && (
            <Chip label="Nenhuma rota despachada ainda." variant="outlined" />
          )}
        </Stack>
      )}

      <VeiculoForm
        open={openVeiculoForm}
        veiculo={veiculoSelecionado}
        onClose={() => {
          setOpenVeiculoForm(false);
          setVeiculoSelecionado(null);
        }}
        onSave={salvarVeiculo}
      />

      <MotoristaForm
        open={openMotoristaForm}
        motorista={motoristaSelecionado}
        onClose={() => {
          setOpenMotoristaForm(false);
          setMotoristaSelecionado(null);
        }}
        onSave={salvarMotorista}
      />

      <AbastecimentoForm
        open={Boolean(veiculoParaAbastecer)}
        veiculo={veiculoParaAbastecer}
        onClose={() => setVeiculoParaAbastecer(null)}
        onSave={salvarAbastecimento}
      />

      <NovaRotaForm
        open={openNovaRota}
        onClose={() => setOpenNovaRota(false)}
        onSave={salvarNovaRota}
      />

      <BaseDialog
        open={Boolean(rotaNoMapa)}
        onClose={() => setRotaNoMapa(null)}
        title={`Rota — ${rotaNoMapa?.veiculo?.placa || ""}`}
        hideSave
      >
        {rotaNoMapa &&
          (rotaNoMapa.ultimaLatitude != null ? (
            <MapaRota
              latitude={rotaNoMapa.ultimaLatitude}
              longitude={rotaNoMapa.ultimaLongitude}
              trilha={rotaNoMapa.posicoes || []}
            />
          ) : (
            <Typography color="text.secondary">
              Ainda não há posições registradas para esta rota.
            </Typography>
          ))}
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

export default Transportes;
