import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";

const initialState = {
  nome: "",
  descricao: "",
};

function CargoForm({ open, onClose, onSave, cargo }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (cargo) {
      setForm({ nome: cargo.nome, descricao: cargo.descricao || "" });
    } else {
      setForm(initialState);
    }
  }, [cargo, open]);

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
      title={cargo ? "Editar Cargo" : "Novo Cargo"}
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

        <Grid size={{ xs: 12 }}>
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

export default CargoForm;
