import { useEffect, useState } from "react";
import { Alert, Grid } from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";
import BaseSelect from "../BaseSelect/BaseSelect";

const estadoInicial = {
  token: "",
  ambiente: "homologacao",
};

function IntegracaoFiscalForm({ open, onClose, onSave, empresa, integracao }) {
  const [form, setForm] = useState(estadoInicial);

  useEffect(() => {
    if (integracao) {
      setForm({
        token: integracao.token || "",
        ambiente: integracao.ambiente || "homologacao",
      });
    } else {
      setForm(estadoInicial);
    }
  }, [integracao, open]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  }

  async function handleSave() {
    await onSave(form);

    setForm(estadoInicial);

    onClose();
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={`Integração Fiscal — ${empresa?.nomeFantasia || ""}`}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Alert severity="info">
            Token da API do Focus NFe. Comece pelo ambiente de homologação
            (gratuito, não exige certificado digital) para testar antes de
            emitir notas reais em produção.
          </Alert>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <BaseFormField
            label="Token Focus NFe"
            name="token"
            value={form.token}
            onChange={handleChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseSelect
            label="Ambiente"
            name="ambiente"
            value={form.ambiente}
            onChange={handleChange}
            options={[
              { value: "homologacao", label: "Homologação" },
              { value: "producao", label: "Produção" },
            ]}
          />
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default IntegracaoFiscalForm;
