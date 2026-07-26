import { useEffect, useState } from "react";
import {
  Alert,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import VendaForm from "../../../components/VendaForm/VendaForm";

import vendaService from "../services/vendaService";

function Vendas() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [vendaDetalhe, setVendaDetalhe] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const columns = [
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 2,
      valueGetter: (_value, row) => row.cliente?.nome || "-",
    },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      valueGetter: (value) => `R$ ${Number(value).toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueGetter: (value) =>
        value === "cancelada" ? "Cancelada" : "Confirmada",
    },
    {
      field: "createdAt",
      headerName: "Data",
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleString("pt-BR"),
    },
  ];

  async function carregarVendas() {
    try {
      const vendas = await vendaService.listar();
      setRows(vendas);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar vendas.");
    }
  }

  async function salvarVenda(dados) {
    try {
      await vendaService.criar(dados);
      await carregarVendas();

      setOpenForm(false);
      setTipoMensagem("success");
      setMensagem("Venda registrada com sucesso.");
    } catch (error) {
      console.error("Erro ao registrar venda:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao registrar venda.",
      );

      throw error;
    }
  }

  async function cancelarVenda(id) {
    try {
      await vendaService.cancelar(id);
      await carregarVendas();

      setTipoMensagem("success");
      setMensagem("Venda cancelada com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar venda:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao cancelar venda.",
      );
    }
  }

  useEffect(() => {
    carregarVendas();
  }, []);

  return (
    <BasePage
      title="Vendas"
      subtitle="Pedidos de Venda"
      buttonLabel="Nova Venda"
      onButtonClick={() => setOpenForm(true)}
    >
      <BaseCrudTable
        rows={rows}
        columns={columns}
        onEdit={setVendaDetalhe}
        onDelete={cancelarVenda}
      />

      <VendaForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={salvarVenda}
      />

      <BaseDialog
        open={Boolean(vendaDetalhe)}
        onClose={() => setVendaDetalhe(null)}
        title={`Venda #${vendaDetalhe?.id || ""}`}
        hideSave
      >
        {vendaDetalhe && (
          <Stack spacing={2}>
            <Typography>
              <strong>Cliente:</strong> {vendaDetalhe.cliente?.nome}
            </Typography>

            <Typography>
              <strong>Status:</strong>{" "}
              {vendaDetalhe.status === "cancelada"
                ? "Cancelada"
                : "Confirmada"}
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell align="right">Qtd.</TableCell>
                  <TableCell align="right">Preço Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {vendaDetalhe.itens?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.produto?.descricao}</TableCell>
                    <TableCell align="right">{item.quantidade}</TableCell>
                    <TableCell align="right">
                      R$ {Number(item.precoUnitario).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      R$ {Number(item.subtotal).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Typography variant="h6" textAlign="right">
              Total: R$ {Number(vendaDetalhe.total).toFixed(2)}
            </Typography>
          </Stack>
        )}
      </BaseDialog>

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={5000}
        onClose={() => setMensagem("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={tipoMensagem}
          onClose={() => setMensagem("")}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </BasePage>
  );
}

export default Vendas;
