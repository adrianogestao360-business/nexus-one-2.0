import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import BaseDialog from "../BaseDialog/BaseDialog";
import BaseFormField from "../BaseFormField/BaseFormField";

function DevolucaoForm({ open, onClose, onSave, pedido, titulo }) {
  const [motivo, setMotivo] = useState("");
  const [quantidades, setQuantidades] = useState({});

  useEffect(() => {
    if (open) {
      setMotivo("");
      setQuantidades({});
    }
  }, [open, pedido]);

  function handleChangeQuantidade(produtoId, value) {
    setQuantidades((old) => ({
      ...old,
      [produtoId]: value,
    }));
  }

  async function handleSave() {
    const itens = Object.entries(quantidades)
      .map(([produtoId, quantidade]) => ({
        produtoId: Number(produtoId),
        quantidade: Number(quantidade),
      }))
      .filter((item) => item.quantidade > 0);

    await onSave({ motivo, itens });

    setMotivo("");
    setQuantidades({});

    onClose();
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={titulo}
    >
      <BaseFormField
        label="Motivo da devolução"
        name="motivo"
        value={motivo}
        onChange={(event) => setMotivo(event.target.value)}
        multiline
        minRows={2}
        required
      />

      <Table size="small" sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell align="right">Qtd. original</TableCell>
            <TableCell align="right">Qtd. a devolver</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {pedido?.itens?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.produto?.descricao}</TableCell>
              <TableCell align="right">{item.quantidade}</TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  type="number"
                  value={quantidades[item.produtoId] || ""}
                  onChange={(event) =>
                    handleChangeQuantidade(
                      item.produtoId,
                      event.target.value,
                    )
                  }
                  slotProps={{
                    htmlInput: { min: 0, max: item.quantidade },
                  }}
                  sx={{ width: 100 }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BaseDialog>
  );
}

export default DevolucaoForm;
