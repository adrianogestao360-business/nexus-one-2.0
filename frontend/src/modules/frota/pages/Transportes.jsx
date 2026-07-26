import { useEffect, useState } from "react";
import { Alert, Button, Paper, Snackbar, Tab, Tabs } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import VeiculoForm from "../../../components/VeiculoForm/VeiculoForm";
import MotoristaForm from "../../../components/MotoristaForm/MotoristaForm";

import veiculoService from "../services/veiculoService";
import motoristaService from "../services/motoristaService";
import entregaService from "../services/entregaService";

const colunasVeiculos = [
  { field: "placa", headerName: "Placa", flex: 1 },
  { field: "modelo", headerName: "Modelo", flex: 2 },
  { field: "capacidade", headerName: "Capacidade", flex: 1 },
];

const colunasMotoristas = [
  { field: "nome", headerName: "Nome", flex: 2 },
  { field: "cnh", headerName: "CNH", flex: 1 },
  { field: "telefone", headerName: "Telefone", flex: 1 },
];

const entregaStatusLabel = {
  em_rota: "Em rota",
  entregue: "Entregue",
};

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

function Transportes() {
  const [aba, setAba] = useState("veiculos");

  const [veiculos, setVeiculos] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const [openVeiculoForm, setOpenVeiculoForm] = useState(false);

  const [motoristas, setMotoristas] = useState([]);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [openMotoristaForm, setOpenMotoristaForm] = useState(false);

  const [entregas, setEntregas] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

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

  useEffect(() => {
    carregarVeiculos();
    carregarMotoristas();
    carregarEntregas();
  }, []);

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

  const ehVeiculos = aba === "veiculos";
  const ehMotoristas = aba === "motoristas";

  return (
    <BasePage
      title="Frota"
      subtitle="Veículos e Motoristas"
      buttonLabel={
        ehVeiculos ? "Novo Veículo" : ehMotoristas ? "Novo Motorista" : undefined
      }
      onButtonClick={() => {
        if (ehVeiculos) {
          setVeiculoSelecionado(null);
          setOpenVeiculoForm(true);
        } else if (ehMotoristas) {
          setMotoristaSelecionado(null);
          setOpenMotoristaForm(true);
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
      </Tabs>

      {ehVeiculos && (
        <BaseCrudTable
          rows={veiculos}
          columns={colunasVeiculos}
          onEdit={(veiculo) => {
            setVeiculoSelecionado(veiculo);
            setOpenVeiculoForm(true);
          }}
          onDelete={desativarVeiculo}
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
