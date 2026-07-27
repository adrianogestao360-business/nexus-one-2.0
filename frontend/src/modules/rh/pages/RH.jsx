import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import CargoForm from "../../../components/CargoForm/CargoForm";
import FuncionarioForm from "../../../components/FuncionarioForm/FuncionarioForm";

import cargoService from "../services/cargoService";
import funcionarioService from "../services/funcionarioService";
import folhaPagamentoService from "../services/folhaPagamentoService";

const statusFolhaLabel = {
  aberta: "Em aberto",
  fechada: "Fechada",
};

const novaFolhaInicial = {
  mes: String(new Date().getMonth() + 1),
  ano: String(new Date().getFullYear()),
};

const itemInicial = {
  proventos: "",
  descontos: "",
};

function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2)}`;
}

function RH() {
  const [aba, setAba] = useState("funcionarios");

  const [cargos, setCargos] = useState([]);
  const [openCargoForm, setOpenCargoForm] = useState(false);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);

  const [funcionarios, setFuncionarios] = useState([]);
  const [openFuncionarioForm, setOpenFuncionarioForm] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

  const [folhas, setFolhas] = useState([]);
  const [folhaSelecionada, setFolhaSelecionada] = useState(null);
  const [openNovaFolha, setOpenNovaFolha] = useState(false);
  const [novaFolha, setNovaFolha] = useState(novaFolhaInicial);

  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [itemForm, setItemForm] = useState(itemInicial);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  function mostrarErro(error, fallback) {
    console.error(fallback, error);

    setTipoMensagem("error");
    setMensagem(error.response?.data?.message || fallback);
  }

  async function carregarCargos() {
    try {
      const dados = await cargoService.listar();
      setCargos(dados);
    } catch (error) {
      mostrarErro(error, "Erro ao carregar cargos.");
    }
  }

  async function carregarFuncionarios() {
    try {
      const dados = await funcionarioService.listar();
      setFuncionarios(dados);
    } catch (error) {
      mostrarErro(error, "Erro ao carregar funcionários.");
    }
  }

  async function carregarFolhas() {
    try {
      const dados = await folhaPagamentoService.listar();
      setFolhas(dados);
    } catch (error) {
      mostrarErro(error, "Erro ao carregar folhas de pagamento.");
    }
  }

  useEffect(() => {
    carregarCargos();
    carregarFuncionarios();
    carregarFolhas();
  }, []);

  async function salvarCargo(dados) {
    try {
      if (cargoSelecionado) {
        await cargoService.atualizar(cargoSelecionado.id, dados);
        setMensagem("Cargo atualizado com sucesso.");
      } else {
        await cargoService.criar(dados);
        setMensagem("Cargo cadastrado com sucesso.");
      }

      await carregarCargos();

      setCargoSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      mostrarErro(error, "Erro ao salvar cargo.");
      throw error;
    }
  }

  async function desativarCargo(id) {
    try {
      await cargoService.desativar(id);
      await carregarCargos();

      setTipoMensagem("success");
      setMensagem("Cargo desativado com sucesso.");
    } catch (error) {
      mostrarErro(error, "Erro ao desativar cargo.");
    }
  }

  async function salvarFuncionario(dados) {
    try {
      if (funcionarioSelecionado) {
        await funcionarioService.atualizar(funcionarioSelecionado.id, dados);
        setMensagem("Funcionário atualizado com sucesso.");
      } else {
        await funcionarioService.criar(dados);
        setMensagem("Funcionário cadastrado com sucesso.");
      }

      await carregarFuncionarios();

      setFuncionarioSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      mostrarErro(error, "Erro ao salvar funcionário.");
      throw error;
    }
  }

  async function desativarFuncionario(id) {
    try {
      await funcionarioService.desativar(id);
      await carregarFuncionarios();

      setTipoMensagem("success");
      setMensagem("Funcionário desativado com sucesso.");
    } catch (error) {
      mostrarErro(error, "Erro ao desativar funcionário.");
    }
  }

  async function abrirFolha(folha) {
    try {
      const detalhe = await folhaPagamentoService.buscarPorId(folha.id);
      setFolhaSelecionada(detalhe);
    } catch (error) {
      mostrarErro(error, "Erro ao carregar folha de pagamento.");
    }
  }

  async function salvarNovaFolha() {
    try {
      const folha = await folhaPagamentoService.criar({
        mes: Number(novaFolha.mes),
        ano: Number(novaFolha.ano),
      });

      await carregarFolhas();

      setOpenNovaFolha(false);
      setNovaFolha(novaFolhaInicial);
      setFolhaSelecionada(folha);

      setTipoMensagem("success");
      setMensagem("Folha de pagamento gerada com sucesso.");
    } catch (error) {
      mostrarErro(error, "Erro ao gerar folha de pagamento.");
      throw error;
    }
  }

  function editarItem(item) {
    setItemSelecionado(item);
    setItemForm({
      proventos: item.proventos,
      descontos: item.descontos,
    });
  }

  async function salvarItem() {
    try {
      await folhaPagamentoService.atualizarItem(itemSelecionado.id, {
        proventos: Number(itemForm.proventos),
        descontos: Number(itemForm.descontos) || 0,
      });

      await abrirFolha(folhaSelecionada);

      setItemSelecionado(null);

      setTipoMensagem("success");
      setMensagem("Item atualizado com sucesso.");
    } catch (error) {
      mostrarErro(error, "Erro ao atualizar item da folha.");
      throw error;
    }
  }

  async function fecharFolha() {
    try {
      await folhaPagamentoService.fechar(folhaSelecionada.id);
      await carregarFolhas();
      await abrirFolha(folhaSelecionada);

      setTipoMensagem("success");
      setMensagem("Folha de pagamento fechada. Títulos a pagar gerados.");
    } catch (error) {
      mostrarErro(error, "Erro ao fechar folha de pagamento.");
    }
  }

  const cargosColunas = [
    { field: "nome", headerName: "Nome", flex: 2 },
    { field: "descricao", headerName: "Descrição", flex: 3 },
  ];

  const funcionariosColunas = [
    { field: "nome", headerName: "Nome", flex: 2 },
    {
      field: "cargo",
      headerName: "Cargo",
      flex: 1,
      valueGetter: (_value, row) => row.cargo?.nome || "-",
    },
    {
      field: "salarioBase",
      headerName: "Salário base",
      flex: 1,
      valueGetter: (value) => formatarMoeda(value),
    },
    {
      field: "dataAdmissao",
      headerName: "Admissão",
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleDateString("pt-BR"),
    },
    { field: "email", headerName: "E-mail", flex: 1.5 },
  ];

  const botao =
    aba === "cargos"
      ? {
          label: "Novo Cargo",
          onClick: () => {
            setCargoSelecionado(null);
            setOpenCargoForm(true);
          },
        }
      : aba === "funcionarios"
        ? {
            label: "Novo Funcionário",
            onClick: () => {
              setFuncionarioSelecionado(null);
              setOpenFuncionarioForm(true);
            },
          }
        : {
            label: "Nova Folha",
            onClick: () => setOpenNovaFolha(true),
          };

  return (
    <BasePage
      title="RH"
      subtitle="Funcionários, cargos e folha de pagamento"
      buttonLabel={botao.label}
      onButtonClick={botao.onClick}
    >
      <Tabs
        value={aba}
        onChange={(_event, valor) => setAba(valor)}
        sx={{ mb: 2 }}
      >
        <Tab value="funcionarios" label="Funcionários" />
        <Tab value="cargos" label="Cargos" />
        <Tab value="folhas" label="Folha de Pagamento" />
      </Tabs>

      {aba === "funcionarios" && (
        <BaseCrudTable
          rows={funcionarios}
          columns={funcionariosColunas}
          onEdit={(funcionario) => {
            setFuncionarioSelecionado(funcionario);
            setOpenFuncionarioForm(true);
          }}
          onDelete={desativarFuncionario}
        />
      )}

      {aba === "cargos" && (
        <BaseCrudTable
          rows={cargos}
          columns={cargosColunas}
          onEdit={(cargo) => {
            setCargoSelecionado(cargo);
            setOpenCargoForm(true);
          }}
          onDelete={desativarCargo}
        />
      )}

      {aba === "folhas" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: folhaSelecionada ? 5 : 12 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mês/Ano</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {folhas.map((folha) => (
                    <TableRow
                      key={folha.id}
                      hover
                      selected={folhaSelecionada?.id === folha.id}
                    >
                      <TableCell>
                        {String(folha.mes).padStart(2, "0")}/{folha.ano}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={statusFolhaLabel[folha.status]}
                          color={
                            folha.status === "fechada" ? "default" : "success"
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button size="small" onClick={() => abrirFolha(folha)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {folhas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ p: 2 }}
                        >
                          Nenhuma folha de pagamento gerada ainda.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {folhaSelecionada && (
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #E5E7EB",
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    mb: 2,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">
                    Folha {String(folhaSelecionada.mes).padStart(2, "0")}/
                    {folhaSelecionada.ano}
                  </Typography>

                  {folhaSelecionada.status === "aberta" && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={fecharFolha}
                    >
                      Fechar Folha
                    </Button>
                  )}
                </Stack>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Funcionário</TableCell>
                      <TableCell align="right">Proventos</TableCell>
                      <TableCell align="right">Descontos</TableCell>
                      <TableCell align="right">Líquido</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {folhaSelecionada.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.funcionario.nome}</TableCell>
                        <TableCell align="right">
                          {formatarMoeda(item.proventos)}
                        </TableCell>
                        <TableCell align="right">
                          {formatarMoeda(item.descontos)}
                        </TableCell>
                        <TableCell align="right">
                          {formatarMoeda(item.valorLiquido)}
                        </TableCell>
                        <TableCell align="right">
                          {folhaSelecionada.status === "aberta" && (
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => editarItem(item)}
                            >
                              Editar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <CargoForm
        open={openCargoForm}
        cargo={cargoSelecionado}
        onClose={() => {
          setOpenCargoForm(false);
          setCargoSelecionado(null);
        }}
        onSave={salvarCargo}
      />

      <FuncionarioForm
        open={openFuncionarioForm}
        funcionario={funcionarioSelecionado}
        cargos={cargos}
        onClose={() => {
          setOpenFuncionarioForm(false);
          setFuncionarioSelecionado(null);
        }}
        onSave={salvarFuncionario}
      />

      <BaseDialog
        open={openNovaFolha}
        onClose={() => {
          setOpenNovaFolha(false);
          setNovaFolha(novaFolhaInicial);
        }}
        onSave={salvarNovaFolha}
        title="Nova Folha de Pagamento"
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <BaseFormField
            label="Mês (1-12)"
            name="mes"
            type="number"
            value={novaFolha.mes}
            onChange={(event) =>
              setNovaFolha((old) => ({ ...old, mes: event.target.value }))
            }
            required
          />

          <BaseFormField
            label="Ano"
            name="ano"
            type="number"
            value={novaFolha.ano}
            onChange={(event) =>
              setNovaFolha((old) => ({ ...old, ano: event.target.value }))
            }
            required
          />
        </Box>
      </BaseDialog>

      <BaseDialog
        open={Boolean(itemSelecionado)}
        onClose={() => setItemSelecionado(null)}
        onSave={salvarItem}
        title={
          itemSelecionado
            ? `Editar ${itemSelecionado.funcionario.nome}`
            : "Editar item"
        }
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <BaseFormField
            label="Proventos"
            name="proventos"
            type="number"
            value={itemForm.proventos}
            onChange={(event) =>
              setItemForm((old) => ({
                ...old,
                proventos: event.target.value,
              }))
            }
            required
          />

          <BaseFormField
            label="Descontos"
            name="descontos"
            type="number"
            value={itemForm.descontos}
            onChange={(event) =>
              setItemForm((old) => ({
                ...old,
                descontos: event.target.value,
              }))
            }
          />
        </Box>
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

export default RH;
