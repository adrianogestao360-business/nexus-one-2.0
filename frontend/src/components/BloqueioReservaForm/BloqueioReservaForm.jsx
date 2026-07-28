import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

import produtoService from "../../modules/produtos/services/produtoService";
import localizacaoService from "../../modules/wms/services/localizacaoService";

const initialState = {
  acao: "bloquear",
  produtoId: "",
  localizacaoId: "",
  quantidade: "",
  motivo: "",
};

const acaoLabel = {
  bloquear: "Bloquear",
  desbloquear: "Desbloquear",
  reservar: "Reservar",
  liberarReserva: "Liberar Reserva",
};

function BloqueioReservaForm({ open, onClose, onSave }) {
  const [form, setForm] = useState(initialState);
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialState);
    produtoService.listar().then(setProdutos);
    localizacaoService.listar().then(setLocalizacoes);
  }, [open]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  }

  async function handleSave() {
    await onSave(form.acao, {
      produtoId: form.produtoId,
      localizacaoId: form.localizacaoId,
      quantidade: form.quantidade,
      motivo: form.motivo,
    });

    setForm(initialState);

    onClose();
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Bloqueio / Reserva de Estoque"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Ação"
            name="acao"
            value={form.acao}
            onChange={handleChange}
            options={Object.entries(acaoLabel).map(([value, label]) => ({
              value,
              label,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <BaseSelect
            label="Produto"
            name="produtoId"
            value={form.produtoId}
            onChange={handleChange}
            options={produtos.map((produto) => ({
              value: produto.id,
              label: produto.descricao,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseSelect
            label="Localização"
            name="localizacaoId"
            value={form.localizacaoId}
            onChange={handleChange}
            options={localizacoes.map((localizacao) => ({
              value: localizacao.id,
              label: localizacao.codigo,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="Quantidade"
            name="quantidade"
            type="number"
            value={form.quantidade}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <BaseFormField
            label="Motivo"
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            required
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default BloqueioReservaForm;
