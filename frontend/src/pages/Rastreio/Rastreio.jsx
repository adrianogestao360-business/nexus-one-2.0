import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import rastreioService from "../../services/rastreioService";

const INTERVALO_MINIMO_MS = 15000;

function Rastreio() {
  const { token } = useParams();

  const [rota, setRota] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [rastreando, setRastreando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const watchIdRef = useRef(null);
  const ultimoEnvioRef = useRef(0);

  async function carregarRota() {
    try {
      const dados = await rastreioService.obterRota(token);
      setRota(dados);
      setErro("");
    } catch {
      setErro(
        "Rota não encontrada ou já concluída. Verifique o link com o despachante.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function iniciarRastreamento() {
    if (!navigator.geolocation) {
      setMensagem("Este navegador não suporta geolocalização.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (posicao) => {
        const agora = Date.now();

        if (agora - ultimoEnvioRef.current < INTERVALO_MINIMO_MS) {
          return;
        }

        ultimoEnvioRef.current = agora;

        rastreioService
          .registrarPosicao(
            token,
            posicao.coords.latitude,
            posicao.coords.longitude,
          )
          .catch((error) =>
            console.error("Erro ao enviar posição:", error),
          );
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
        setMensagem(
          "Não foi possível acessar sua localização. Verifique a permissão do navegador.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 10000 },
    );

    setRastreando(true);
  }

  function pararRastreamento() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setRastreando(false);
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function confirmarEntrega(entregaId) {
    try {
      await rastreioService.confirmarEntrega(token, entregaId);
      setMensagem("Entrega confirmada!");
      await carregarRota();
    } catch (error) {
      setMensagem(
        error.response?.data?.message || "Erro ao confirmar entrega.",
      );
    }
  }

  if (carregando) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (erro) {
    return (
      <Box sx={{ minHeight: "100vh", p: 3, bgcolor: "#F8FAFC" }}>
        <Alert severity="error">{erro}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", p: 2 }}>
      <Stack spacing={2} sx={{ maxWidth: 480, mx: "auto" }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #E5E7EB" }}>
          <Typography variant="h6" fontWeight={700}>
            Rota — {rota.entregas.length} entrega(s)
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Veículo {rota.veiculo?.placa} — {rota.motorista?.nome}
          </Typography>
        </Paper>

        <Button
          variant="contained"
          size="large"
          startIcon={<MyLocationIcon />}
          onClick={rastreando ? pararRastreamento : iniciarRastreamento}
          color={rastreando ? "error" : "primary"}
          disabled={rota.status !== "em_andamento"}
        >
          {rastreando ? "Parar rastreamento" : "Iniciar rastreamento"}
        </Button>

        {rastreando && (
          <Chip
            icon={<MyLocationIcon />}
            label="Compartilhando localização..."
            color="success"
            variant="outlined"
          />
        )}

        <Stack spacing={1.5}>
          {rota.entregas.map((entrega) => (
            <Paper
              key={entrega.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: entrega.status === "entregue" ? 0.6 : 1,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LocalShippingIcon
                  color={entrega.status === "entregue" ? "success" : "action"}
                />
                <Typography
                  sx={{
                    textDecoration:
                      entrega.status === "entregue" ? "line-through" : "none",
                  }}
                >
                  {entrega.cliente}
                </Typography>
              </Stack>

              {entrega.status === "entregue" ? (
                <CheckCircleIcon color="success" />
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => confirmarEntrega(entrega.id)}
                >
                  Confirmar
                </Button>
              )}
            </Paper>
          ))}
        </Stack>

        {rota.status === "concluida" && (
          <Alert severity="success">Rota concluída. Obrigado!</Alert>
        )}
      </Stack>

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={4000}
        onClose={() => setMensagem("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setMensagem("")}>
          {mensagem}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Rastreio;
