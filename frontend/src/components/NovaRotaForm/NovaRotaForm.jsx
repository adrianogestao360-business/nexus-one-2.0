import { useEffect, useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseSelect from "../BaseSelect/BaseSelect";

import veiculoService from "../../modules/frota/services/veiculoService";
import motoristaService from "../../modules/frota/services/motoristaService";
import separacaoService from "../../modules/wms/services/separacaoService";

const initialState = {
  veiculoId: "",
  motoristaId: "",
  separacaoIds: [],
};

function NovaRotaForm({ open, onClose, onSave }) {
  const [form, setForm] = useState(initialState);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [separacoesProntas, setSeparacoesProntas] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialState);
    veiculoService.listar().then(setVeiculos);
    motoristaService.listar().then(setMotoristas);
    separacaoService.listar("separado").then(setSeparacoesProntas);
  }, [open]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((old) => ({ ...old, [name]: value }));
  }

  function alternarSeparacao(id) {
    setForm((old) => ({
      ...old,
      separacaoIds: old.separacaoIds.includes(id)
        ? old.separacaoIds.filter((item) => item !== id)
        : [...old.separacaoIds, id],
    }));
  }

  async function handleSave() {
    await onSave({
      veiculoId: Number(form.veiculoId),
      motoristaId: Number(form.motoristaId),
      separacaoIds: form.separacaoIds,
    });
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Nova Rota (despachar entregas)"
    >
      <Stack spacing={2}>
        <BaseSelect
          label="Veículo"
          name="veiculoId"
          value={form.veiculoId}
          onChange={handleChange}
          options={veiculos.map((v) => ({ value: v.id, label: v.placa }))}
          required
        />

        <BaseSelect
          label="Motorista"
          name="motoristaId"
          value={form.motoristaId}
          onChange={handleChange}
          options={motoristas.map((m) => ({ value: m.id, label: m.nome }))}
          required
        />

        <Typography variant="subtitle2">
          Separações prontas para expedição
        </Typography>

        <Stack spacing={0.5}>
          {separacoesProntas.map((separacao) => (
            <FormControlLabel
              key={separacao.id}
              control={
                <Checkbox
                  checked={form.separacaoIds.includes(separacao.id)}
                  onChange={() => alternarSeparacao(separacao.id)}
                />
              }
              label={`Venda #${separacao.vendaId} — ${separacao.venda?.cliente?.nome || "-"}`}
            />
          ))}

          {separacoesProntas.length === 0 && (
            <Typography color="text.secondary" variant="body2">
              Nenhuma separação pronta para expedição no momento.
            </Typography>
          )}
        </Stack>
      </Stack>
    </BaseDialog>
  );
}

export default NovaRotaForm;
