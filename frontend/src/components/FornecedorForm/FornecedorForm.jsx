import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";

const initialState = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
};

function FornecedorForm({ open, onClose, onSave, fornecedor }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (fornecedor) {
      setForm(fornecedor);
    } else {
      setForm(initialState);
    }
  }, [fornecedor, open]);

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
      title={fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
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

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="CPF/CNPJ"
            name="documento"
            value={form.documento}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="E-mail"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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

export default FornecedorForm;
