import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import BasePage from "../../../components/BasePage/BasePage";
import MetaVendaForm from "../../../components/MetaVendaForm/MetaVendaForm";

import metaVendaService from "../services/metaVendaService";
import usuarioService from "../../usuarios/services/usuarioService";

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2)}`;
}

function MetaCard({ meta, onEdit, onDelete }) {
  const percentual = Math.min(Number(meta.percentualAtingido), 100);
  const atingiu = Number(meta.percentualAtingido) >= 100;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {meta.usuario.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {nomesMeses[meta.mes - 1]}/{meta.ano}
          </Typography>
        </Box>

        <Stack direction="row">
          <IconButton size="small" onClick={() => onEdit(meta)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(meta.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", mb: 0.5 }}
        >
          <Typography variant="body2">
            {formatarMoeda(meta.realizado)} de {formatarMoeda(meta.valorMeta)}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {Number(meta.percentualAtingido).toFixed(0)}%
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={percentual}
          color={atingiu ? "success" : "primary"}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Chip
          size="small"
          label={`Comissão (${Number(meta.percentualComissao)}%): ${formatarMoeda(meta.comissao)}`}
          color={atingiu ? "success" : "default"}
        />
      </Stack>
    </Paper>
  );
}

function Metas() {
  const [metas, setMetas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [metaSelecionada, setMetaSelecionada] = useState(null);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregarMetas() {
    try {
      const dados = await metaVendaService.listar();
      setMetas(dados);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar metas.");
    }
  }

  async function carregarVendedores() {
    try {
      const dados = await usuarioService.listar();
      setVendedores(dados.filter((usuario) => usuario.ativo));
    } catch (error) {
      console.error("Erro ao carregar vendedores:", error);
    }
  }

  useEffect(() => {
    carregarMetas();
    carregarVendedores();
  }, []);

  async function salvarMeta(dados) {
    try {
      if (metaSelecionada) {
        await metaVendaService.atualizar(metaSelecionada.id, dados);
        setMensagem("Meta atualizada com sucesso.");
      } else {
        await metaVendaService.criar(dados);
        setMensagem("Meta criada com sucesso.");
      }

      await carregarMetas();

      setMetaSelecionada(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar meta:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao salvar meta.");

      throw error;
    }
  }

  async function excluirMeta(id) {
    try {
      await metaVendaService.excluir(id);
      await carregarMetas();

      setTipoMensagem("success");
      setMensagem("Meta excluída com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir meta:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao excluir meta.");
    }
  }

  return (
    <BasePage
      title="Metas de Vendas"
      subtitle="Metas mensais e comissão por vendedor"
      buttonLabel="Nova Meta"
      onButtonClick={() => {
        setMetaSelecionada(null);
        setOpenForm(true);
      }}
    >
      {metas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(148, 163, 184, 0.14)" }}
        >
          <Typography color="text.secondary">
            Nenhuma meta cadastrada ainda.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {metas.map((meta) => (
            <Grid key={meta.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <MetaCard
                meta={meta}
                onEdit={(item) => {
                  setMetaSelecionada(item);
                  setOpenForm(true);
                }}
                onDelete={excluirMeta}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <MetaVendaForm
        open={openForm}
        meta={metaSelecionada}
        vendedores={vendedores}
        onClose={() => {
          setOpenForm(false);
          setMetaSelecionada(null);
        }}
        onSave={salvarMeta}
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
        <Alert severity={tipoMensagem} onClose={() => setMensagem("")}>
          {mensagem}
        </Alert>
      </Snackbar>
    </BasePage>
  );
}

export default Metas;
