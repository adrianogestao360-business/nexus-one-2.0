import { useEffect, useState } from "react";

import { Divider, Grid, Typography } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

const initialState = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
  tipoDocumento: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  municipio: "",
  codigoMunicipioIBGE: "",
  uf: "",
  cep: "",
  limiteCredito: "",
};

function ClienteForm({ open, onClose, onSave, cliente }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (cliente) {
      setForm({ ...initialState, ...cliente });
    } else {
      setForm(initialState);
    }
  }, [cliente, open]);

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
      title={cliente ? "Editar Cliente" : "Novo Cliente"}
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
          <BaseSelect
            label="Tipo de documento"
            name="tipoDocumento"
            value={form.tipoDocumento || ""}
            onChange={handleChange}
            options={[
              { value: "fisica", label: "Pessoa Física (CPF)" },
              { value: "juridica", label: "Pessoa Jurídica (CNPJ)" },
            ]}
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

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Endereço fiscal (necessário para emitir NF-e)
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <BaseFormField
            label="Logradouro"
            name="logradouro"
            value={form.logradouro}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Número"
            name="numero"
            value={form.numero}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Complemento"
            name="complemento"
            value={form.complemento}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Bairro"
            name="bairro"
            value={form.bairro}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Município"
            name="municipio"
            value={form.municipio}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Código IBGE do município"
            name="codigoMunicipioIBGE"
            value={form.codigoMunicipioIBGE}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="UF"
            name="uf"
            value={form.uf}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="CEP"
            name="cep"
            value={form.cep}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Limite de crédito"
            name="limiteCredito"
            type="number"
            value={form.limiteCredito}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default ClienteForm;
