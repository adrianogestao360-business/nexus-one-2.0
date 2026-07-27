import { useEffect, useState } from "react";
import {
  Alert,
  Button,
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
import CompraForm from "../../../components/CompraForm/CompraForm";
import DevolucaoForm from "../../../components/DevolucaoForm/DevolucaoForm";

import compraService from "../services/compraService";

function Compras() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [compraDetalhe, setCompraDetalhe] = useState(null);
  const [compraParaDevolver, setCompraParaDevolver] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const columns = [
    {
      field: "fornecedor",
      headerName: "Fornecedor",
      flex: 2,
      valueGetter: (_value, row) => row.fornecedor?.nome || "-",
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

  async function carregarCompras() {
    try {
      const compras = await compraService.listar();
      setRows(compras);
    } catch (error) {
      console.error("Erro ao carregar compras:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar compras.");
    }
  }

  async function salvarCompra(dados) {
    try {
      await compraService.criar(dados);
      await carregarCompras();

      setOpenForm(false);
      setTipoMensagem("success");
      setMensagem("Compra registrada com sucesso.");
    } catch (error) {
      console.error("Erro ao registrar compra:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao registrar compra.",
      );

      throw error;
    }
  }

  async function cancelarCompra(id) {
    try {
      await compraService.cancelar(id);
      await carregarCompras();

      setTipoMensagem("success");
      setMensagem("Compra cancelada com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar compra:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao cancelar compra.",
      );
    }
  }

  async function devolverCompra(dados) {
    try {
      await compraService.devolver(compraParaDevolver.id, dados);
      await carregarCompras();

      setTipoMensagem("success");
      setMensagem("Devolução registrada com sucesso.");
    } catch (error) {
      console.error("Erro ao registrar devolução:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao registrar devolução.",
      );

      throw error;
    }
  }

  useEffect(() => {
    carregarCompras();
  }, []);

  return (
    <BasePage
      title="Compras"
      subtitle="Pedidos de Compra"
      buttonLabel="Nova Compra"
      onButtonClick={() => setOpenForm(true)}
    >
      <BaseCrudTable
        rows={rows}
        columns={columns}
        onEdit={setCompraDetalhe}
        onDelete={cancelarCompra}
      />

      <CompraForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={salvarCompra}
      />

      <BaseDialog
        open={Boolean(compraDetalhe)}
        onClose={() => setCompraDetalhe(null)}
        title={`Compra #${compraDetalhe?.id || ""}`}
        hideSave
      >
        {compraDetalhe && (
          <Stack spacing={2}>
            <Typography>
              <strong>Fornecedor:</strong> {compraDetalhe.fornecedor?.nome}
            </Typography>

            <Typography>
              <strong>Status:</strong>{" "}
              {compraDetalhe.status === "cancelada"
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
                {compraDetalhe.itens?.map((item) => (
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
              Total: R$ {Number(compraDetalhe.total).toFixed(2)}
            </Typography>

            {compraDetalhe.status === "confirmada" && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => setCompraParaDevolver(compraDetalhe)}
                sx={{ alignSelf: "flex-start" }}
              >
                Registrar Devolução
              </Button>
            )}
          </Stack>
        )}
      </BaseDialog>

      <DevolucaoForm
        open={Boolean(compraParaDevolver)}
        pedido={compraParaDevolver}
        titulo={`Devolução — Compra #${compraParaDevolver?.id || ""}`}
        onClose={() => setCompraParaDevolver(null)}
        onSave={devolverCompra}
      />

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

export default Compras;
