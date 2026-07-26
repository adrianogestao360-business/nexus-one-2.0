import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import BasePage from "../../../components/BasePage/BasePage";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import BaseSelect from "../../../components/BaseSelect/BaseSelect";
import ExpedicaoForm from "../../../components/ExpedicaoForm/ExpedicaoForm";

import { useAuth } from "../../../contexts/AuthContext";

import separacaoService from "../services/separacaoService";
import zonaService from "../services/zonaService";
import localizacaoService from "../services/localizacaoService";

const statusLabel = {
  pendente: "Pendente",
  em_separacao: "Em separação",
  separado: "Separado",
  expedido: "Expedido",
  cancelada: "Cancelada",
};

function SeparacaoTable({ rows, userId, onAssumir, onAbrir, onExpedirClick }) {
  const columns = [
    {
      field: "venda",
      headerName: "Venda",
      flex: 1,
      valueGetter: (_value, row) => `#${row.vendaId}`,
    },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 2,
      valueGetter: (_value, row) => row.venda?.cliente?.nome || "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueGetter: (value) => statusLabel[value] || value,
    },
    {
      field: "separador",
      headerName: "Separador",
      flex: 1,
      valueGetter: (_value, row) => row.separador?.nome || "-",
    },
    {
      field: "createdAt",
      headerName: "Data",
      flex: 1,
      valueGetter: (value) => new Date(value).toLocaleString("pt-BR"),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 240,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;

        if (row.status === "pendente") {
          return (
            <Button size="small" onClick={() => onAssumir(row.id)}>
              Assumir
            </Button>
          );
        }

        if (row.status === "em_separacao") {
          if (row.separadorId === userId) {
            return (
              <Button size="small" onClick={() => onAbrir(row)}>
                Abrir
              </Button>
            );
          }

          return (
            <Typography variant="caption" color="text.secondary">
              Em separação por {row.separador?.nome}
            </Typography>
          );
        }

        if (row.status === "separado") {
          return (
            <Button
              size="small"
              color="success"
              onClick={() => onExpedirClick(row)}
            >
              Expedir
            </Button>
          );
        }

        return null;
      },
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        height: 560,
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8FAFC",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#F8FAFC",
          },
        }}
      />
    </Paper>
  );
}

function WMS() {
  const { user } = useAuth();

  const [aba, setAba] = useState("separacoes");
  const [separacoes, setSeparacoes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [separacaoParaExpedir, setSeparacaoParaExpedir] = useState(null);
  const [openZonaForm, setOpenZonaForm] = useState(false);
  const [nomeZona, setNomeZona] = useState("");
  const [openLocalizacaoForm, setOpenLocalizacaoForm] = useState(false);
  const [codigoLocalizacao, setCodigoLocalizacao] = useState("");
  const [zonaLocalizacaoId, setZonaLocalizacaoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregarSeparacoes() {
    try {
      const dados = await separacaoService.listar();
      setSeparacoes(dados);
    } catch (error) {
      console.error("Erro ao carregar separações:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar separações.");
    }
  }

  async function carregarZonas() {
    try {
      const dados = await zonaService.listar();
      setZonas(dados);
    } catch (error) {
      console.error("Erro ao carregar zonas:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar zonas.");
    }
  }

  async function carregarLocalizacoes() {
    try {
      const dados = await localizacaoService.listar();
      setLocalizacoes(dados);
    } catch (error) {
      console.error("Erro ao carregar localizações:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar localizações.");
    }
  }

  useEffect(() => {
    carregarSeparacoes();
    carregarZonas();
    carregarLocalizacoes();
  }, []);

  async function assumir(id) {
    try {
      await separacaoService.assumir(id);
      await carregarSeparacoes();

      setTipoMensagem("success");
      setMensagem("Separação assumida com sucesso.");
    } catch (error) {
      console.error("Erro ao assumir separação:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao assumir separação.",
      );
    }
  }

  async function abrir(row) {
    try {
      const atual = await separacaoService.buscarPorId(row.id);
      setDetalhe(atual);
    } catch (error) {
      console.error("Erro ao abrir separação:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao abrir separação.");
    }
  }

  async function marcarItem(itemId, separado) {
    try {
      const atualizado = await separacaoService.marcarItem(
        detalhe.id,
        itemId,
        separado,
      );
      setDetalhe(atualizado);
    } catch (error) {
      console.error("Erro ao marcar item:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao marcar item.");
    }
  }

  async function concluir() {
    try {
      await separacaoService.concluir(detalhe.id);
      setDetalhe(null);
      await carregarSeparacoes();

      setTipoMensagem("success");
      setMensagem("Separação concluída com sucesso.");
    } catch (error) {
      console.error("Erro ao concluir separação:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao concluir separação.",
      );
    }
  }

  async function liberar() {
    try {
      await separacaoService.liberar(detalhe.id);
      setDetalhe(null);
      await carregarSeparacoes();

      setTipoMensagem("success");
      setMensagem("Separação liberada.");
    } catch (error) {
      console.error("Erro ao liberar separação:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao liberar separação.",
      );
    }
  }

  async function expedir({ veiculoId, motoristaId }) {
    try {
      await separacaoService.expedir(
        separacaoParaExpedir.id,
        veiculoId,
        motoristaId,
      );
      setSeparacaoParaExpedir(null);
      await carregarSeparacoes();

      setTipoMensagem("success");
      setMensagem("Separação expedida com sucesso.");
    } catch (error) {
      console.error("Erro ao expedir separação:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao expedir separação.",
      );

      throw error;
    }
  }

  async function salvarZona() {
    try {
      await zonaService.criar({ nome: nomeZona });
      setNomeZona("");
      setOpenZonaForm(false);
      await carregarZonas();

      setTipoMensagem("success");
      setMensagem("Zona criada com sucesso.");
    } catch (error) {
      console.error("Erro ao criar zona:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao criar zona.");
    }
  }

  async function salvarLocalizacao() {
    try {
      await localizacaoService.criar({
        codigo: codigoLocalizacao,
        zonaId: zonaLocalizacaoId ? Number(zonaLocalizacaoId) : undefined,
      });
      setCodigoLocalizacao("");
      setZonaLocalizacaoId("");
      setOpenLocalizacaoForm(false);
      await carregarLocalizacoes();

      setTipoMensagem("success");
      setMensagem("Localização criada com sucesso.");
    } catch (error) {
      console.error("Erro ao criar localização:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao criar localização.",
      );
    }
  }

  return (
    <BasePage
      title="WMS"
      subtitle="Endereçamento e Separação"
      buttonLabel={
        aba === "zonas"
          ? "Nova Zona"
          : aba === "localizacoes"
            ? "Nova Localização"
            : undefined
      }
      onButtonClick={() =>
        aba === "zonas"
          ? setOpenZonaForm(true)
          : setOpenLocalizacaoForm(true)
      }
    >
      <Tabs
        value={aba}
        onChange={(_event, valor) => setAba(valor)}
        sx={{ mb: 2 }}
      >
        <Tab value="separacoes" label="Separações" />
        <Tab value="zonas" label="Zonas" />
        <Tab value="localizacoes" label="Localizações" />
      </Tabs>

      {aba === "separacoes" && (
        <SeparacaoTable
          rows={separacoes}
          userId={user?.id}
          onAssumir={assumir}
          onAbrir={abrir}
          onExpedirClick={setSeparacaoParaExpedir}
        />
      )}

      {aba === "zonas" && (
        <Paper
          elevation={0}
          sx={{ p: 2, borderRadius: 3, border: "1px solid #E5E7EB" }}
        >
          <Stack spacing={1}>
            {zonas.map((zona) => (
              <Typography key={zona.id}>{zona.nome}</Typography>
            ))}

            {zonas.length === 0 && (
              <Typography color="text.secondary">
                Nenhuma zona cadastrada.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      {aba === "localizacoes" && (
        <Paper
          elevation={0}
          sx={{ p: 2, borderRadius: 3, border: "1px solid #E5E7EB" }}
        >
          <Stack spacing={1}>
            {localizacoes.map((localizacao) => (
              <Typography key={localizacao.id}>
                {localizacao.codigo}
                {localizacao.zona ? ` (Zona: ${localizacao.zona.nome})` : ""}
              </Typography>
            ))}

            {localizacoes.length === 0 && (
              <Typography color="text.secondary">
                Nenhuma localização cadastrada.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      <ExpedicaoForm
        open={Boolean(separacaoParaExpedir)}
        onClose={() => setSeparacaoParaExpedir(null)}
        onSave={expedir}
      />

      <BaseDialog
        open={openZonaForm}
        onClose={() => setOpenZonaForm(false)}
        onSave={salvarZona}
        title="Nova Zona"
      >
        <BaseFormField
          label="Nome"
          name="nome"
          value={nomeZona}
          onChange={(event) => setNomeZona(event.target.value)}
          required
        />
      </BaseDialog>

      <BaseDialog
        open={openLocalizacaoForm}
        onClose={() => setOpenLocalizacaoForm(false)}
        onSave={salvarLocalizacao}
        title="Nova Localização"
      >
        <Stack spacing={2}>
          <BaseFormField
            label="Código"
            name="codigo"
            value={codigoLocalizacao}
            onChange={(event) => setCodigoLocalizacao(event.target.value)}
            required
          />

          <BaseSelect
            label="Zona"
            name="zonaId"
            value={zonaLocalizacaoId}
            onChange={(event) => setZonaLocalizacaoId(event.target.value)}
            options={zonas.map((zona) => ({
              value: zona.id,
              label: zona.nome,
            }))}
          />
        </Stack>
      </BaseDialog>

      <BaseDialog
        open={Boolean(detalhe)}
        onClose={() => setDetalhe(null)}
        title={`Separação da Venda #${detalhe?.vendaId || ""}`}
        hideSave
      >
        {detalhe && (
          <Stack spacing={2}>
            <Typography>
              <strong>Cliente:</strong> {detalhe.venda?.cliente?.nome}
            </Typography>

            <Stack spacing={1}>
              {detalhe.itens?.map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={item.separado}
                      onChange={(event) =>
                        marcarItem(item.id, event.target.checked)
                      }
                    />
                  }
                  label={`${item.produto?.descricao} — Qtd: ${item.quantidade}${
                    item.produto?.zona
                      ? ` (Zona: ${item.produto.zona.nome}${
                          item.produto.endereco
                            ? " - " + item.produto.endereco
                            : ""
                        })`
                      : ""
                  }`}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={liberar}>Liberar</Button>

              <Button
                variant="contained"
                onClick={concluir}
                disabled={detalhe.itens?.some((item) => !item.separado)}
              >
                Concluir
              </Button>
            </Stack>
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

export default WMS;
