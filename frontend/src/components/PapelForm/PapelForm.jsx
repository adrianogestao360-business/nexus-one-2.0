import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";

const initialState = {
  nome: "",
  descricao: "",
};

function PapelForm({ open, onClose, onSave, papel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (papel) {
      setForm(papel);
    } else {
      setForm(initialState);
    }
  }, [papel, open]);

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
      title={papel ? "Editar Papel" : "Novo Papel"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <BaseFormField
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default PapelForm;
