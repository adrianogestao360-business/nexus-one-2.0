import { useEffect, useState } from "react";
import {
  Grid,
  IconButton,
  Stack,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseSelect from "../BaseSelect/BaseSelect";
import BaseFormField from "../BaseFormField/BaseFormField";

import fornecedorService from "../../modules/fornecedores/services/fornecedorService";
import produtoService from "../../modules/produtos/services/produtoService";
import localizacaoService from "../../modules/wms/services/localizacaoService";

const itemVazio = { produtoId: "", quantidade: 1, precoUnitario: "" };

function CompraForm({ open, onClose, onSave }) {
  const [fornecedorId, setFornecedorId] = useState("");
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [itens, setItens] = useState([{ ...itemVazio }]);
  const [parcelas, setParcelas] = useState(1);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    fornecedorService.listar().then(setFornecedores);
    produtoService.listar().then(setProdutos);
    localizacaoService.listar().then(setLocalizacoes);
  }, [open]);

  useEffect(() => {
    if (open) {
      setFornecedorId("");
      setLocalizacaoId("");
      setItens([{ ...itemVazio }]);
      setParcelas(1);
    }
  }, [open]);

  function alterarItem(index, campo, valor) {
    setItens((old) =>
      old.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item,
      ),
    );
  }

  function adicionarItem() {
    setItens((old) => [...old, { ...itemVazio }]);
  }

  function removerItem(index) {
    setItens((old) => old.filter((_, i) => i !== index));
  }

  function subtotalDoItem(item) {
    if (!item.precoUnitario || !item.quantidade) {
      return 0;
    }

    return Number(item.precoUnitario) * Number(item.quantidade);
  }

  const total = itens.reduce((soma, item) => soma + subtotalDoItem(item), 0);

  async function handleSave() {
    await onSave({
      fornecedorId,
      localizacaoId: localizacaoId ? Number(localizacaoId) : undefined,
      parcelas: Number(parcelas) || 1,
      itens: itens
        .filter((item) => item.produtoId)
        .map((item) => ({
          produtoId: Number(item.produtoId),
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario),
        })),
    });
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Nova Compra"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <BaseSelect
            label="Fornecedor"
            name="fornecedorId"
            value={fornecedorId}
            onChange={(event) => setFornecedorId(event.target.value)}
            options={fornecedores.map((fornecedor) => ({
              value: fornecedor.id,
              label: fornecedor.nome,
            }))}
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <BaseSelect
            label="Localização de destino"
            name="localizacaoId"
            value={localizacaoId}
            onChange={(event) => setLocalizacaoId(event.target.value)}
            options={localizacoes.map((localizacao) => ({
              value: localizacao.id,
              label: localizacao.codigo,
            }))}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Itens
          </Typography>

          <Stack spacing={2}>
            {itens.map((item, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <BaseSelect
                  label="Produto"
                  name={`produto-${index}`}
                  value={item.produtoId}
                  onChange={(event) =>
                    alterarItem(index, "produtoId", event.target.value)
                  }
                  options={produtos.map((produto) => ({
                    value: produto.id,
                    label: `${produto.descricao} (estoque: ${produto.estoque})`,
                  }))}
                />

                <BaseFormField
                  label="Qtd."
                  name={`quantidade-${index}`}
                  type="number"
                  value={item.quantidade}
                  onChange={(event) =>
                    alterarItem(index, "quantidade", event.target.value)
                  }
                />

                <BaseFormField
                  label="Preço unit."
                  name={`preco-${index}`}
                  type="number"
                  value={item.precoUnitario}
                  onChange={(event) =>
                    alterarItem(index, "precoUnitario", event.target.value)
                  }
                />

                <Typography sx={{ minWidth: 100 }}>
                  R$ {subtotalDoItem(item).toFixed(2)}
                </Typography>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removerItem(index)}
                  disabled={itens.length === 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={adicionarItem}
            sx={{ mt: 2 }}
          >
            Adicionar item
          </Button>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <BaseFormField
            label="Parcelas"
            name="parcelas"
            type="number"
            value={parcelas}
            onChange={(event) => setParcelas(event.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="h6" textAlign="right">
            Total: R$ {total.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </BaseDialog>
  );
}

export default CompraForm;
