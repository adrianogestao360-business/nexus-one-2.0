import { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseSelect from "../BaseSelect/BaseSelect";
import BaseFormField from "../BaseFormField/BaseFormField";

import veiculoService from "../../modules/frota/services/veiculoService";
import motoristaService from "../../modules/frota/services/motoristaService";

function ExpedicaoForm({ open, onClose, onSave }) {
  const [veiculoId, setVeiculoId] = useState("");
  const [motoristaId, setMotoristaId] = useState("");
  const [volumes, setVolumes] = useState(1);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setVeiculoId("");
    setMotoristaId("");
    setVolumes(1);
    veiculoService.listar().then(setVeiculos);
    motoristaService.listar().then(setMotoristas);
  }, [open]);

  async function handleSave() {
    await onSave({ veiculoId, motoristaId, volumes });
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Expedir Separação"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <BaseSelect
            label="Veículo"
            name="veiculoId"
            value={veiculoId}
            onChange={(event) => setVeiculoId(event.target.value)}
            options={veiculos.map((veiculo) => ({
              value: veiculo.id,
              label: `${veiculo.placa} — ${veiculo.modelo}`,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseSelect
            label="Motorista"
            name="motoristaId"
            value={motoristaId}
            onChange={(event) => setMotoristaId(event.target.value)}
            options={motoristas.map((motorista) => ({
              value: motorista.id,
              label: motorista.nome,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <BaseFormField
            label="Volumes"
            name="volumes"
            type="number"
            value={volumes}
            onChange={(event) => setVolumes(event.target.value)}
            required
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default ExpedicaoForm;
