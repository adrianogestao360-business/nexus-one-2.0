import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import BasePage from "../../../components/BasePage/BasePage";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import BaseSelect from "../../../components/BaseSelect/BaseSelect";

import oportunidadeService from "../services/oportunidadeService";
import clienteService from "../../clientes/services/clienteService";

const colunas = [
  { estagio: "novo", label: "Novo" },
  { estagio: "qualificacao", label: "Qualificação" },
  { estagio: "proposta", label: "Proposta" },
  { estagio: "negociacao", label: "Negociação" },
  { estagio: "ganho", label: "Ganho" },
  { estagio: "perdido", label: "Perdido" },
];

const formVazio = { titulo: "", clienteId: "", valor: "", observacoes: "" };

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2)}`;
}

function OportunidadeCard({ oportunidade, onDragStart }) {
  return (
    <Card
      elevation={0}
      draggable
      onDragStart={(event) => onDragStart(event, oportunidade.id)}
      sx={{
        borderRadius: 2,
        border: "1px solid #E5E7EB",
        cursor: "grab",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,.08)" },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {oportunidade.titulo}
        </Typography>

        <Typography variant="caption" color="text.secondary" noWrap component="div">
          {oportunidade.cliente?.nome}
        </Typography>

        <Typography variant="body2" color="primary" fontWeight={600} sx={{ mt: 0.5 }}>
          {formatarMoeda(oportunidade.valor)}
        </Typography>

        {oportunidade.estagio === "perdido" && oportunidade.motivoPerda && (
          <Chip
            label={oportunidade.motivoPerda}
            size="small"
            color="error"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function CRM() {
  const [oportunidades, setOportunidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(formVazio);
  const [motivoPerdaDialog, setMotivoPerdaDialog] = useState(null);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregar() {
    try {
      const dados = await oportunidadeService.listar();
      setOportunidades(dados);
    } catch (error) {
      console.error("Erro ao carregar oportunidades:", error);
      setTipoMensagem("error");
      setMensagem("Erro ao carregar oportunidades.");
    }
  }

  useEffect(() => {
    carregar();
    clienteService.listar().then(setClientes);
  }, []);

  async function salvar() {
    try {
      await oportunidadeService.criar({
        ...form,
        clienteId: Number(form.clienteId),
      });
      setForm(formVazio);
      setOpenForm(false);
      await carregar();

      setTipoMensagem("success");
      setMensagem("Oportunidade criada com sucesso.");
    } catch (error) {
      console.error("Erro ao criar oportunidade:", error);
      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao criar oportunidade.",
      );
      throw error;
    }
  }

  function handleDragStart(event, id) {
    event.dataTransfer.setData("text/plain", String(id));
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  async function handleDrop(event, estagioAlvo) {
    event.preventDefault();

    const id = Number(event.dataTransfer.getData("text/plain"));
    const oportunidade = oportunidades.find((o) => o.id === id);

    if (!oportunidade || oportunidade.estagio === estagioAlvo) {
      return;
    }

    if (estagioAlvo === "perdido") {
      setMotivoPerdaDialog(id);
      return;
    }

    await confirmarMovimentacao(id, estagioAlvo);
  }

  async function confirmarMovimentacao(id, estagioAlvo, motivo) {
    try {
      await oportunidadeService.moverEstagio(id, estagioAlvo, motivo);
      await carregar();

      setTipoMensagem("success");
      setMensagem("Oportunidade movida com sucesso.");
    } catch (error) {
      console.error("Erro ao mover oportunidade:", error);
      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao mover oportunidade.",
      );
    }
  }

  async function confirmarPerda() {
    await confirmarMovimentacao(motivoPerdaDialog, "perdido", motivoPerda);
    setMotivoPerdaDialog(null);
    setMotivoPerda("");
  }

  return (
    <BasePage
      title="CRM"
      subtitle="Funil de Vendas"
      buttonLabel="Nova Oportunidade"
      onButtonClick={() => setOpenForm(true)}
    >
      <Box sx={{ overflowX: "auto", pb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ minWidth: 1100 }}>
          {colunas.map((coluna) => {
            const itens = oportunidades.filter(
              (o) => o.estagio === coluna.estagio,
            );
            const totalColuna = itens.reduce(
              (soma, o) => soma + Number(o.valor),
              0,
            );

            return (
              <Paper
                key={coluna.estagio}
                elevation={0}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, coluna.estagio)}
                sx={{
                  width: 180,
                  minWidth: 180,
                  borderRadius: 3,
                  border: "1px solid #E5E7EB",
                  p: 1.5,
                  bgcolor: "#F8FAFC",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {coluna.label}
                </Typography>

                <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1.5 }}>
                  {itens.length} — {formatarMoeda(totalColuna)}
                </Typography>

                <Stack spacing={1} sx={{ minHeight: 80 }}>
                  {itens.map((oportunidade) => (
                    <OportunidadeCard
                      key={oportunidade.id}
                      oportunidade={oportunidade}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Box>

      <BaseDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={salvar}
        title="Nova Oportunidade"
      >
        <Stack spacing={2}>
          <BaseFormField
            label="Título"
            name="titulo"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />

          <BaseSelect
            label="Cliente"
            name="clienteId"
            value={form.clienteId}
            onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
            options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            required
          />

          <BaseFormField
            label="Valor estimado"
            name="valor"
            type="number"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
          />

          <BaseFormField
            label="Observações"
            name="observacoes"
            value={form.observacoes}
            onChange={(e) =>
              setForm({ ...form, observacoes: e.target.value })
            }
            multiline
            rows={3}
          />
        </Stack>
      </BaseDialog>

      <BaseDialog
        open={Boolean(motivoPerdaDialog)}
        onClose={() => {
          setMotivoPerdaDialog(null);
          setMotivoPerda("");
        }}
        onSave={confirmarPerda}
        title="Motivo da perda"
      >
        <BaseFormField
          label="Motivo"
          name="motivoPerda"
          value={motivoPerda}
          onChange={(e) => setMotivoPerda(e.target.value)}
          required
        />
      </BaseDialog>

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={5000}
        onClose={() => setMensagem("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={tipoMensagem} onClose={() => setMensagem("")}>
          {mensagem}
        </Alert>
      </Snackbar>
    </BasePage>
  );
}

export default CRM;
