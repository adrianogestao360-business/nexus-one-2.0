import Grid from "@mui/material/Grid";
import {
  Paper,
  Typography,
  Box,
} from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import MainLayout from "../../layouts/MainLayout";
import PageHeader from "../../components/PageHeader/PageHeader";
import CardStat from "../../components/CardStat/CardStat";

function Dashboard() {
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
            value="0"
            icon={<Inventory2Icon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Clientes"
            value="0"
            icon={<PeopleIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Entregas"
            value="0"
            icon={<LocalShippingIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CardStat
            title="Faturamento"
            value="R$ 0,00"
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

            <Box
              sx={{
                height: 320,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#9CA3AF",
              }}
            >
              Gráfico será implementado na Sprint 4
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
              Atividades Recentes
            </Typography>

            <Typography color="text.secondary">
              Nenhuma atividade registrada.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
}

export default Dashboard;