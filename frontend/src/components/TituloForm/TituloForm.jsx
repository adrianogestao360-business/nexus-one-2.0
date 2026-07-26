import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

import clienteService from "../../modules/clientes/services/clienteService";
import fornecedorService from "../../modules/fornecedores/services/fornecedorService";

const initialState = {
  tipo: "receber",
  descricao: "",
  valor: "",
  vencimento: new Date().toISOString().slice(0, 10),
  contraparteId: "",
};

function TituloForm({ open, onClose, onSave }) {
  const [form, setForm] = useState(initialState);
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialState);
    clienteService.listar().then(setClientes);
    fornecedorService.listar().then(setFornecedores);
  }, [open]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
      ...(name === "tipo" ? { contraparteId: "" } : {}),
    }));
  }

  async function handleSave() {
    await onSave({
      tipo: form.tipo,
      descricao: form.descricao,
      valor: form.valor,
      vencimento: form.vencimento,
      clienteId: form.tipo === "receber" ? form.contraparteId || null : null,
      fornecedorId: form.tipo === "pagar" ? form.contraparteId || null : null,
    });

    setForm(initialState);

    onClose();
  }

  const opcoesContraparte =
    form.tipo === "receber"
      ? clientes.map((cliente) => ({ value: cliente.id, label: cliente.nome }))
      : fornecedores.map((fornecedor) => ({
          value: fornecedor.id,
          label: fornecedor.nome,
        }));

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Novo Título"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            options={[
              { value: "receber", label: "A Receber" },
              { value: "pagar", label: "A Pagar" },
            ]}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <BaseFormField
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Valor"
            name="valor"
            type="number"
            value={form.valor}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Vencimento"
            name="vencimento"
            type="date"
            value={form.vencimento}
            onChange={handleChange}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label={form.tipo === "receber" ? "Cliente" : "Fornecedor"}
            name="contraparteId"
            value={form.contraparteId}
            onChange={handleChange}
            options={opcoesContraparte}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default TituloForm;
