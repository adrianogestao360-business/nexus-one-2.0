import { useEffect, useState } from "react";
import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

import zonaService from "../../modules/wms/services/zonaService";

const initialState = {
  codigo: "",
  descricao: "",
  categoria: "",
  unidade: "",
  preco: "",
  estoque: "",
  estoqueMinimo: "",
  zonaId: "",
  endereco: "",
};

function ProdutoForm({
  open,
  onClose,
  onSave,
  produto,
}) {
  const [form, setForm] = useState(initialState);
  const [zonas, setZonas] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    zonaService.listar().then(setZonas);
  }, [open]);

  useEffect(() => {
    if (produto) {
      setForm({ ...initialState, ...produto, zonaId: produto.zonaId || "" });
    } else {
      setForm(initialState);
    }
  }, [produto, open]);

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
      title={produto ? "Editar Produto" : "Novo Produto"}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <BaseFormField
            label="Código"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <BaseFormField
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <BaseFormField
            label="Categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <BaseFormField
            label="Unidade"
            name="unidade"
            value={form.unidade}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <BaseFormField
            label="Preço"
            name="preco"
            value={form.preco}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <BaseFormField
            label="Estoque"
            name="estoque"
            value={form.estoque}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <BaseFormField
            label="Estoque mínimo"
            name="estoqueMinimo"
            value={form.estoqueMinimo}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Zona"
            name="zonaId"
            value={form.zonaId}
            onChange={handleChange}
            options={zonas.map((zona) => ({
              value: zona.id,
              label: zona.nome,
            }))}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <BaseFormField
            label="Endereço"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default ProdutoForm;