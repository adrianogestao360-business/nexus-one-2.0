import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import CreditCardOffIcon from "@mui/icons-material/CreditCardOff";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import BuildIcon from "@mui/icons-material/Build";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import iaService from "../../services/iaService";

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2)}`;
}

function NexusAiPanel({ resumo }) {
  const [gerando, setGerando] = useState(false);
  const [plano, setPlano] = useState("");
  const [erro, setErro] = useState("");

  async function gerarPlano() {
    setGerando(true);
    setErro("");
    setPlano("");

    try {
      const resultado = await iaService.gerarPlanoDeAcao();
      setPlano(resultado.plano);
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Não foi possível gerar o plano de ação.",
      );
    } finally {
      setGerando(false);
    }
  }

  if (!resumo) {
    return null;
  }

  const highlights = [
    {
      icon: <AssignmentLateIcon fontSize="small" />,
      texto: `${resumo.pedidosAguardandoSeparacao} pedido(s) aguardando separação`,
    },
    {
      icon: <CreditCardOffIcon fontSize="small" />,
      texto: `${resumo.clientesAcimaDoLimite} cliente(s) acima do limite de crédito`,
    },
    {
      icon: <Inventory2Icon fontSize="small" />,
      texto: `${resumo.produtosSemEstoque} produto(s) sem estoque disponível`,
    },
    {
      icon: <BuildIcon fontSize="small" />,
      texto: `${resumo.veiculosEmManutencao} veículo(s) em manutenção`,
    },
    {
      icon: <TrendingUpIcon fontSize="small" />,
      texto:
        resumo.faturamento.percentual !== null
          ? `Faturamento em ${resumo.faturamento.percentual.toFixed(0)}% da meta do mês`
          : `Faturamento do mês: ${formatarMoeda(resumo.faturamento.valorRealizado)}`,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(124, 58, 237, 0.35)",
        background:
          "linear-gradient(180deg, rgba(124, 58, 237, 0.10) 0%, rgba(20, 27, 45, 1) 60%)",
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 1 }}>
        <AutoAwesomeIcon sx={{ color: "#A78BFA", fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={700}>
          Nexus AI
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
        Resumo inteligente do dia.
      </Typography>

      <Stack spacing={1} sx={{ mb: 1.5 }}>
        {highlights.map((item) => (
          <Stack
            key={item.texto}
            direction="row"
            sx={{ alignItems: "center", gap: 1, color: "#CBD5E1" }}
          >
            <Box sx={{ color: "#A78BFA", display: "flex", "& svg": { fontSize: 16 } }}>
              {item.icon}
            </Box>
            <Typography variant="caption">{item.texto}</Typography>
          </Stack>
        ))}
      </Stack>

      <Button
        variant="contained"
        size="small"
        fullWidth
        startIcon={
          gerando ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <AutoAwesomeIcon />
          )
        }
        onClick={gerarPlano}
        disabled={gerando}
        sx={{
          background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)",
        }}
      >
        {gerando ? "Gerando..." : "Gerar plano de ação"}
      </Button>

      {erro && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {erro}
        </Alert>
      )}

      {plano && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            border: "1px solid rgba(148, 163, 184, 0.14)",
            bgcolor: "#0B1220",
            whiteSpace: "pre-line",
          }}
        >
          <Typography variant="body2">{plano}</Typography>
        </Paper>
      )}
    </Paper>
  );
}

export default NexusAiPanel;
