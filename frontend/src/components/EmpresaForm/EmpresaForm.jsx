import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";

const initialState = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  email: "",
  telefone: "",
};

function EmpresaForm({ open, onClose, onSave, empresa }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (empresa) {
      setForm(empresa);
    } else {
      setForm(initialState);
    }
  }, [empresa, open]);

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
      title={empresa ? "Editar Empresa" : "Nova Empresa"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <BaseFormField
            label="Razão Social"
            name="razaoSocial"
            value={form.razaoSocial}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <BaseFormField
            label="Nome Fantasia"
            name="nomeFantasia"
            value={form.nomeFantasia}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="CNPJ"
            name="cnpj"
            value={form.cnpj}
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

export default EmpresaForm;