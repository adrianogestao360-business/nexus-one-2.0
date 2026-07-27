import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

const initialState = {
  placa: "",
  modelo: "",
  capacidade: "",
  kmMedioPorLitro: "",
  status: "disponivel",
};

function VeiculoForm({ open, onClose, onSave, veiculo }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (veiculo) {
      setForm({ ...initialState, ...veiculo });
    } else {
      setForm(initialState);
    }
  }, [veiculo, open]);

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
      title={veiculo ? "Editar Veículo" : "Novo Veículo"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Placa"
            name="placa"
            value={form.placa}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <BaseFormField
            label="Modelo"
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <BaseFormField
            label="Capacidade"
            name="capacidade"
            value={form.capacidade}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="Km médio por litro"
            name="kmMedioPorLitro"
            type="number"
            value={form.kmMedioPorLitro}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseSelect
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { value: "disponivel", label: "Disponível" },
              { value: "manutencao", label: "Em manutenção" },
            ]}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default VeiculoForm;
