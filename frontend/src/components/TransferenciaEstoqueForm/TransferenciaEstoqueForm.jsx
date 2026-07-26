import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

import produtoService from "../../modules/produtos/services/produtoService";
import localizacaoService from "../../modules/wms/services/localizacaoService";

const initialState = {
  produtoId: "",
  localizacaoOrigemId: "",
  localizacaoDestinoId: "",
  quantidade: "",
  motivo: "",
};

function TransferenciaEstoqueForm({ open, onClose, onSave }) {
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
      title="Transferir Estoque entre Localizações"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <BaseSelect
            label="Produto"
            name="produtoId"
            value={form.produtoId}
            onChange={handleChange}
            options={produtos.map((produto) => ({
              value: produto.id,
              label: `${produto.descricao} (estoque: ${produto.estoque})`,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseSelect
            label="Localização de origem"
            name="localizacaoOrigemId"
            value={form.localizacaoOrigemId}
            onChange={handleChange}
            options={localizacoes.map((localizacao) => ({
              value: localizacao.id,
              label: localizacao.codigo,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseSelect
            label="Localização de destino"
            name="localizacaoDestinoId"
            value={form.localizacaoDestinoId}
            onChange={handleChange}
            options={localizacoes.map((localizacao) => ({
              value: localizacao.id,
              label: localizacao.codigo,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Quantidade"
            name="quantidade"
            type="number"
            value={form.quantidade}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <BaseFormField
            label="Motivo (opcional)"
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default TransferenciaEstoqueForm;
