import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

import produtoService from "../../modules/produtos/services/produtoService";
import localizacaoService from "../../modules/wms/services/localizacaoService";

const initialState = {
  tipo: "geral",
  localizacaoId: "",
  produtoId: "",
  observacao: "",
};

function InventarioForm({ open, onClose, onSave }) {
  const [form, setForm] = useState(initialState);
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialState);
    produtoService.listar().then(setProdutos);
    localizacaoService.listar().then(setLocalizacoes);
  }, [open]);

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
      title="Novo Inventário"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            options={[
              { value: "geral", label: "Geral" },
              { value: "rotativo", label: "Rotativo" },
            ]}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Localização (opcional)"
            name="localizacaoId"
            value={form.localizacaoId}
            onChange={handleChange}
            options={localizacoes.map((localizacao) => ({
              value: localizacao.id,
              label: localizacao.codigo,
            }))}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Produto (opcional)"
            name="produtoId"
            value={form.produtoId}
            onChange={handleChange}
            options={produtos.map((produto) => ({
              value: produto.id,
              label: produto.descricao,
            }))}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <BaseFormField
            label="Observação"
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            multiline
            minRows={2}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default InventarioForm;
