import { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";

const initialState = { valorLitro: "", litros: "" };

function AbastecimentoForm({ open, veiculo, onClose, onSave }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (open) {
      setForm(initialState);
    }
  }, [open]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((old) => ({ ...old, [name]: value }));
  }

  async function handleSave() {
    await onSave(form);
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Lançar Abastecimento"
    >
      <Grid container spacing={2}>
        {veiculo && (
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary">
              Veículo: {veiculo.placa} — {veiculo.modelo}
            </Typography>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="Valor por litro (R$)"
            name="valorLitro"
            type="number"
            value={form.valorLitro}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="Litros (opcional)"
            name="litros"
            type="number"
            value={form.litros}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default AbastecimentoForm;
