import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

const initialState = {
  nome: "",
  cargoId: "",
  salarioBase: "",
  dataAdmissao: new Date().toISOString().slice(0, 10),
  email: "",
  telefone: "",
};

function FuncionarioForm({ open, onClose, onSave, funcionario, cargos }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (funcionario) {
      setForm({
        nome: funcionario.nome,
        cargoId: funcionario.cargoId || "",
        salarioBase: funcionario.salarioBase,
        dataAdmissao: new Date(funcionario.dataAdmissao)
          .toISOString()
          .slice(0, 10),
        email: funcionario.email || "",
        telefone: funcionario.telefone || "",
      });
    } else {
      setForm(initialState);
    }
  }, [funcionario, open]);

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

  const opcoesCargo = cargos.map((cargo) => ({
    value: cargo.id,
    label: cargo.nome,
  }));

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={funcionario ? "Editar Funcionário" : "Novo Funcionário"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <BaseFormField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Cargo"
            name="cargoId"
            value={form.cargoId}
            onChange={handleChange}
            options={opcoesCargo}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Salário base"
            name="salarioBase"
            type="number"
            value={form.salarioBase}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Data de admissão"
            name="dataAdmissao"
            type="date"
            value={form.dataAdmissao}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
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

export default FuncionarioForm;
