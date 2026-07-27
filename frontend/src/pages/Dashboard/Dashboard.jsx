import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
  Paper,
  Typography,
  Box,
  Stack,
  Avatar,
  CircularProgress,
  Button,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PercentIcon from "@mui/icons-material/Percent";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddBoxIcon from "@mui/icons-material/AddBox";

import MainLayout from "../../layouts/MainLayout";
import CardStat from "../../components/CardStat/CardStat";
import MapaEntregas from "../../components/MapaEntregas/MapaEntregas";
import NexusAiPanel from "../../components/NexusAiPanel/NexusAiPanel";

import dashboardService from "../../services/dashboardService";
import notificacaoService from "../../services/notificacaoService";
import iaService from "../../services/iaService";
import { useAuth } from "../../contexts/AuthContext";

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function calcularVariacao(atual, anterior) {
  if (!anterior) {
    return undefined;
  }

  return ((atual - anterior) / anterior) * 100;
}

function saudacao() {
  const hora = new Date().getHours();

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function ProgressoWidget({ titulo, icon, atual, total }) {
  const percentual = total > 0 ? Math.round((atual / total) * 100) : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 3,
        border: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {titulo.toUpperCase()}
        </Typography>
        {icon}
      </Stack>

      <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={percentual}
            size={42}
            thickness={5}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 10 }} fontWeight={700}>
              {percentual}%
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="body1" fontWeight={700}>
            {atual} / {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Em andamento
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dados, setDados] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [resumoIa, setResumoIa] = useState(null);

  useEffect(() => {
    dashboardService
      .obter()
      .then(setDados)
      .catch((error) => console.error("Erro ao carregar dashboard:", error));

    notificacaoService
      .listar()
      .then(setNotificacoes)
      .catch((error) => console.error("Erro ao carregar notificações:", error));

    iaService
      .obterResumo()
      .then(setResumoIa)
      .catch((error) => console.error("Erro ao carregar resumo Nexus AI:", error));
  }, []);

  const resumo = dados?.resumo || {
    totalProdutos: 0,
    totalClientes: 0,
    totalEntregas: 0,
    faturamentoTotal: 0,
  };
  const faturamentoMensal = dados?.faturamentoMensal || [];
  const atividadesRecentes = dados?.atividadesRecentes || [];
  const hoje = dados?.hoje || {
    receita: 0,
    pedidos: 0,
    receitaOntem: 0,
    pedidosOntem: 0,
  };
  const margemMesAtual = dados?.margemMesAtual ?? 0;
  const progresso = dados?.progresso || {
    separacao: { concluidas: 0, total: 0 },
    entregas: { noPrazo: 0, total: 0 },
    frota: { disponiveis: 0, total: 0 },
  };
  const rotasAtivas = dados?.rotasAtivas || [];

  const variacaoReceita = calcularVariacao(hoje.receita, hoje.receitaOntem);
  const variacaoPedidos = calcularVariacao(hoje.pedidos, hoje.pedidosOntem);

  return (
    <MainLayout>
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{ justifyContent: "space-between", alignItems: { md: "center" }, mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {saudacao()}, {user?.nome?.split(" ")[0] || ""}!
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" — "}Visão geral da operação
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Receita hoje"
            value={formatarMoeda(hoje.receita)}
            icon={<AttachMoneyIcon />}
            color="primary"
            variacao={variacaoReceita}
            trend={faturamentoMensal.map((item) => item.total)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Pedidos hoje"
            value={String(hoje.pedidos)}
            icon={<PointOfSaleIcon />}
            color="secondary"
            variacao={variacaoPedidos}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Clientes ativos"
            value={String(resumo.totalClientes)}
            icon={<PeopleIcon />}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Margem (mês)"
            value={`${margemMesAtual.toFixed(1)}%`}
            icon={<PercentIcon />}
            color="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 2,
              height: 300,
              borderRadius: 3,
              border: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Evolução do Faturamento
            </Typography>

            {faturamentoMensal.length > 0 ? (
              <LineChart
                height={230}
                series={[
                  {
                    data: faturamentoMensal.map((item) => item.total),
                    label: "Faturamento",
                    color: "#3B82F6",
                    valueFormatter: (valor) => formatarMoeda(valor),
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "point",
                    data: faturamentoMensal.map((item) => item.mes),
                  },
                ]}
              />
            ) : (
              <Box
                sx={{
                  height: 230,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#94A3B8",
                }}
              >
                Carregando...
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <NexusAiPanel resumo={resumoIa} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ProgressoWidget
            titulo="Separação"
            icon={<Inventory2Icon sx={{ color: "#3B82F6", fontSize: 20 }} />}
            atual={progresso.separacao.concluidas}
            total={progresso.separacao.total}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ProgressoWidget
            titulo="Entregas"
            icon={<LocalShippingIcon sx={{ color: "#22C55E", fontSize: 20 }} />}
            atual={progresso.entregas.noPrazo}
            total={progresso.entregas.total}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ProgressoWidget
            titulo="Frota disponível"
            icon={<LocalShippingIcon sx={{ color: "#F59E0B", fontSize: 20 }} />}
            atual={progresso.frota.disponiveis}
            total={progresso.frota.total}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Mapa de Entregas
            </Typography>

            <MapaEntregas rotas={rotasAtivas} altura={240} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(148, 163, 184, 0.14)",
              height: "100%",
              overflowY: "auto",
              maxHeight: 288,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Alertas Inteligentes
            </Typography>

            {notificacoes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhum alerta no momento.
              </Typography>
            )}

            <Stack spacing={1}>
              {notificacoes.slice(0, 6).map((notificacao) => (
                <Typography
                  key={notificacao.chave}
                  variant="caption"
                  sx={{
                    color:
                      notificacao.severidade === "error"
                        ? "error.main"
                        : "text.primary",
                  }}
                >
                  • {notificacao.mensagem}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(148, 163, 184, 0.14)",
              overflowY: "auto",
              maxHeight: 300,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Atividades Recentes
            </Typography>

            {atividadesRecentes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nenhuma atividade registrada.
              </Typography>
            )}

            <Stack spacing={1.25}>
              {atividadesRecentes.map((atividade, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1.25}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor:
                        atividade.tipo === "venda"
                          ? "rgba(59, 130, 246, 0.16)"
                          : "rgba(245, 158, 11, 0.16)",
                      color:
                        atividade.tipo === "venda" ? "#3B82F6" : "#F59E0B",
                    }}
                  >
                    {atividade.tipo === "venda" ? (
                      <ShoppingCartIcon fontSize="small" />
                    ) : (
                      <Inventory2OutlinedIcon fontSize="small" />
                    )}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {atividade.descricao}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {formatarMoeda(atividade.valor)} —{" "}
                      {new Date(atividade.data).toLocaleDateString("pt-BR")}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Acessos Rápidos
            </Typography>

            <Grid container spacing={1}>
              <Grid size={6}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<PointOfSaleIcon />}
                  onClick={() => navigate("/vendas")}
                >
                  Nova Venda
                </Button>
              </Grid>
              <Grid size={6}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<GroupAddIcon />}
                  onClick={() => navigate("/clientes")}
                >
                  Novo Cliente
                </Button>
              </Grid>
              <Grid size={6}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<AddBoxIcon />}
                  onClick={() => navigate("/produtos")}
                >
                  Novo Produto
                </Button>
              </Grid>
              <Grid size={6}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<ReceiptLongIcon />}
                  onClick={() => navigate("/financeiro")}
                >
                  Nota Fiscal
                </Button>
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate("/relatorios")}
                >
                  Relatórios
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
}

export default Dashboard;
