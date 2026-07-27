import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

import papelService from "../../modules/usuarios/services/papelService";

const initialState = {
  nome: "",
  email: "",
  senha: "",
  papelIds: [],
};

function UsuarioForm({ open, onClose, onSave, usuario }) {
  const [form, setForm] = useState(initialState);
  const [papeis, setPapeis] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    papelService.listar().then(setPapeis);
  }, [open]);

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome,
        email: usuario.email,
        senha: "",
        papelIds: usuario.papeis?.map((papel) => papel.id) || [],
      });
    } else {
      setForm(initialState);
    }
  }, [usuario, open]);

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
      title={usuario ? "Editar Usuário" : "Novo Usuário"}
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

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="E-mail"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label={
              usuario
                ? "Nova senha (deixe em branco para manter)"
                : "Senha"
            }
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            required={!usuario}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseSelect
            label="Papéis"
            name="papelIds"
            value={form.papelIds}
            onChange={handleChange}
            multiple
            options={papeis.map((papel) => ({
              value: papel.id,
              label: papel.nome,
            }))}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default UsuarioForm;
