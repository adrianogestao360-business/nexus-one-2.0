import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

const initialState = {
  nome: "",
  tipo: "banco",
  saldoInicial: "",
};

function ContaBancariaForm({ open, onClose, onSave, conta }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (conta) {
      setForm({
        nome: conta.nome,
        tipo: conta.tipo,
        saldoInicial: conta.saldoInicial,
      });
    } else {
      setForm(initialState);
    }
  }, [conta, open]);

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
      title={conta ? "Editar Conta Bancária" : "Nova Conta Bancária"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <BaseSelect
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            options={[
              { value: "banco", label: "Banco" },
              { value: "caixa", label: "Caixa" },
            ]}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <BaseFormField
            label="Saldo inicial"
            name="saldoInicial"
            type="number"
            value={form.saldoInicial}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default ContaBancariaForm;
