import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Paper,
  Typography,
  Box,
  Stack,
  Avatar,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import MainLayout from "../../layouts/MainLayout";
import PageHeader from "../../components/PageHeader/PageHeader";
import CardStat from "../../components/CardStat/CardStat";

import dashboardService from "../../services/dashboardService";

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Dashboard() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    dashboardService
      .obter()
      .then(setDados)
      .catch((error) => console.error("Erro ao carregar dashboard:", error));
  }, []);

  const resumo = dados?.resumo || {
    totalProdutos: 0,
    totalClientes: 0,
    totalEntregas: 0,
    faturamentoTotal: 0,
  };
  const faturamentoMensal = dados?.faturamentoMensal || [];
  const atividadesRecentes = dados?.atividadesRecentes || [];

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da operação"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Produtos"
            value={String(resumo.totalProdutos)}
            icon={<Inventory2Icon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Clientes"
            value={String(resumo.totalClientes)}
            icon={<PeopleIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Entregas"
            value={String(resumo.totalEntregas)}
            icon={<LocalShippingIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Faturamento"
            value={formatarMoeda(resumo.faturamentoTotal)}
            icon={<AttachMoneyIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 3,
              height: 420,
              borderRadius: 3,
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              mb={2}
            >
              Evolução do Faturamento
            </Typography>

            {faturamentoMensal.length > 0 ? (
              <LineChart
                height={320}
                series={[
                  {
                    data: faturamentoMensal.map((item) => item.total),
                    label: "Faturamento",
                    color: "#2563EB",
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
                  height: 320,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#9CA3AF",
                }}
              >
                Carregando...
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              height: 420,
              borderRadius: 3,
              border: "1px solid #E5E7EB",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              mb={2}
            >
              Atividades Recentes
            </Typography>

            {atividadesRecentes.length === 0 && (
              <Typography color="text.secondary">
                Nenhuma atividade registrada.
              </Typography>
            )}

            <Stack spacing={2}>
              {atividadesRecentes.map((atividade, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor:
                        atividade.tipo === "venda" ? "#EEF4FF" : "#FFF7ED",
                      color:
                        atividade.tipo === "venda" ? "#2563EB" : "#C2410C",
                    }}
                  >
                    {atividade.tipo === "venda" ? (
                      <ShoppingCartIcon fontSize="small" />
                    ) : (
                      <Inventory2OutlinedIcon fontSize="small" />
                    )}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      noWrap
                    >
                      {atividade.descricao}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatarMoeda(atividade.valor)} —{" "}
                      {new Date(atividade.data).toLocaleDateString("pt-BR")}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
}

export default Dashboard;