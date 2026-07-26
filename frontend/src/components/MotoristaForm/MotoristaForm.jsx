import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";

const initialState = {
  nome: "",
  cnh: "",
  telefone: "",
};

function MotoristaForm({ open, onClose, onSave, motorista }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (motorista) {
      setForm(motorista);
    } else {
      setForm(initialState);
    }
  }, [motorista, open]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  }

  async function handleSave() {
    await onSave(form);

    setForm(initialState);

    onClose();
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={motorista ? "Editar Motorista" : "Novo Motorista"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <BaseFormField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="CNH"
            name="cnh"
            value={form.cnh}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="Telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default MotoristaForm;
