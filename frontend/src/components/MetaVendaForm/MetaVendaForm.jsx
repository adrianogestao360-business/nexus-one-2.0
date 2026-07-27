import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

function estadoInicial() {
  const agora = new Date();

  return {
    usuarioId: "",
    mes: String(agora.getMonth() + 1),
    ano: String(agora.getFullYear()),
    valorMeta: "",
    percentualComissao: "",
  };
}

function MetaVendaForm({ open, onClose, onSave, meta, vendedores }) {
  const [form, setForm] = useState(estadoInicial());

  useEffect(() => {
    if (meta) {
      setForm({
        usuarioId: meta.usuarioId,
        mes: String(meta.mes),
        ano: String(meta.ano),
        valorMeta: meta.valorMeta,
        percentualComissao: meta.percentualComissao,
      });
    } else {
      setForm(estadoInicial());
    }
  }, [meta, open]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  }

  async function handleSave() {
    await onSave(form);

    setForm(estadoInicial());

    onClose();
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={meta ? "Editar Meta" : "Nova Meta"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <BaseSelect
            label="Vendedor"
            name="usuarioId"
            value={form.usuarioId}
            onChange={handleChange}
            disabled={Boolean(meta)}
            options={vendedores.map((vendedor) => ({
              value: vendedor.id,
              label: vendedor.nome,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <BaseFormField
            label="Mês (1-12)"
            name="mes"
            type="number"
            value={form.mes}
            onChange={handleChange}
            disabled={Boolean(meta)}
            required
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <BaseFormField
            label="Ano"
            name="ano"
            type="number"
            value={form.ano}
            onChange={handleChange}
            disabled={Boolean(meta)}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <BaseFormField
            label="Valor da meta"
            name="valorMeta"
            type="number"
            value={form.valorMeta}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <BaseFormField
            label="Comissão (%)"
            name="percentualComissao"
            type="number"
            value={form.percentualComissao}
            onChange={handleChange}
            required
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default MetaVendaForm;
