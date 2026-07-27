import { useEffect, useState } from "react";

import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

const initialState = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  email: "",
  telefone: "",
  inscricaoEstadual: "",
  inscricaoEstadualIsento: false,
  regimeTributario: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  municipio: "",
  codigoMunicipioIBGE: "",
  uf: "",
  cep: "",
};

const opcoesRegimeTributario = [
  { value: "simples_nacional", label: "Simples Nacional" },
  { value: "lucro_presumido", label: "Lucro Presumido" },
  { value: "lucro_real", label: "Lucro Real" },
];

function EmpresaForm({ open, onClose, onSave, empresa }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (empresa) {
      setForm({ ...initialState, ...empresa });
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

  function handleChangeCheckbox(event) {
    const { name, checked } = event.target;

    setForm((old) => ({
      ...old,
      [name]: checked,
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

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Dados fiscais (necessários para emitir NF-e)
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Inscrição Estadual"
            name="inscricaoEstadual"
            value={form.inscricaoEstadual}
            onChange={handleChange}
            disabled={form.inscricaoEstadualIsento}
          />
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FormControlLabel
            control={
              <Checkbox
                name="inscricaoEstadualIsento"
                checked={Boolean(form.inscricaoEstadualIsento)}
                onChange={handleChangeCheckbox}
              />
            }
            label="Isento de Inscrição Estadual"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Regime tributário"
            name="regimeTributario"
            value={form.regimeTributario || ""}
            onChange={handleChange}
            options={opcoesRegimeTributario}
          />
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
      </Grid>
    </BaseDialog>
  );
}

export default EmpresaForm;
