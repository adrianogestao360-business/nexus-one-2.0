import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import SecurityIcon from "@mui/icons-material/Security";

import BasePage from "../../../components/BasePage/BasePage";
import BaseDialog from "../../../components/BaseDialog/BaseDialog";
import BaseFormField from "../../../components/BaseFormField/BaseFormField";
import PapelForm from "../../../components/PapelForm/PapelForm";

import { useAuth } from "../../../contexts/AuthContext";

import papelService from "../services/papelService";
import permissaoService from "../services/permissaoService";
import minhaContaService from "../services/minhaContaService";

const senhaInicial = {
  senhaAtual: "",
  novaSenha: "",
  confirmarNovaSenha: "",
};

function Configuracoes() {
  const { user } = useAuth();

  const [aba, setAba] = useState("papeis");

  const [papeis, setPapeis] = useState([]);
  const [permissoes, setPermissoes] = useState([]);

  const [formSenha, setFormSenha] = useState(senhaInicial);

  const [openPapelForm, setOpenPapelForm] = useState(false);
  const [papelSelecionado, setPapelSelecionado] = useState(null);

  const [papelPermissoesAberto, setPapelPermissoesAberto] = useState(null);
  const [permissoesMarcadas, setPermissoesMarcadas] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  async function carregarPapeis() {
    try {
      const dados = await papelService.listar();
      setPapeis(dados);
    } catch (error) {
      console.error("Erro ao carregar papéis:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar papéis.");
    }
  }

  async function carregarPermissoes() {
    try {
      const dados = await permissaoService.listar();
      setPermissoes(dados);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar permissões.");
    }
  }

  useEffect(() => {
    carregarPapeis();
    carregarPermissoes();
  }, []);

  async function salvarPapel(dados) {
    try {
      if (papelSelecionado) {
        await papelService.atualizar(papelSelecionado.id, dados);
        setMensagem("Papel atualizado com sucesso.");
      } else {
        await papelService.criar(dados);
        setMensagem("Papel criado com sucesso.");
      }

      await carregarPapeis();

      setPapelSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar papel:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao salvar papel.");

      throw error;
    }
  }

  async function abrirPermissoes(papel) {
    try {
      const atual = await papelService.buscarPorId(papel.id);

      setPapelPermissoesAberto(atual);
      setPermissoesMarcadas(
        atual.papelPermissoes.map((item) => item.permissao.id),
      );
    } catch (error) {
      console.error("Erro ao abrir permissões:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao abrir permissões do papel.");
    }
  }

  function alternarPermissao(permissaoId, marcado) {
    setPermissoesMarcadas((old) =>
      marcado
        ? [...old, permissaoId]
        : old.filter((id) => id !== permissaoId),
    );
  }

  async function salvarPermissoes() {
    try {
      await papelService.definirPermissoes(
        papelPermissoesAberto.id,
        permissoesMarcadas,
      );

      setPapelPermissoesAberto(null);
      await carregarPapeis();

      setTipoMensagem("success");
      setMensagem("Permissões atualizadas com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);

      setTipoMensagem("error");
      setMensagem(
        error.response?.data?.message || "Erro ao salvar permissões.",
      );
    }
  }

  function handleChangeSenha(event) {
    const { name, value } = event.target;

    setFormSenha((old) => ({
      ...old,
      [name]: value,
    }));
  }

  async function trocarSenha() {
    if (formSenha.novaSenha !== formSenha.confirmarNovaSenha) {
      setTipoMensagem("error");
      setMensagem("A nova senha e a confirmação não conferem.");
      return;
    }

    try {
      await minhaContaService.trocarSenha(
        formSenha.senhaAtual,
        formSenha.novaSenha,
      );

      setFormSenha(senhaInicial);

      setTipoMensagem("success");
      setMensagem("Senha alterada com sucesso.");
    } catch (error) {
      console.error("Erro ao trocar senha:", error);

      setTipoMensagem("error");
      setMensagem(error.response?.data?.message || "Erro ao trocar senha.");
    }
  }

  const columns = [
    {
      field: "nome",
      headerName: "Nome",
      flex: 1,
    },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 2,
    },
    {
      field: "permissoes",
      headerName: "Permissões",
      flex: 1,
      valueGetter: (_value, row) => row.papelPermissoes?.length || 0,
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            size="small"
            onClick={() => {
              setPapelSelecionado(params.row);
              setOpenPapelForm(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => abrirPermissoes(params.row)}
          >
            <SecurityIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const ehPapeis = aba === "papeis";

  return (
    <BasePage
      title="Configurações"
      subtitle="Papéis e Permissões"
      buttonLabel={ehPapeis ? "Novo Papel" : undefined}
      onButtonClick={() => {
        setPapelSelecionado(null);
        setOpenPapelForm(true);
      }}
    >
      <Tabs
        value={aba}
        onChange={(_event, valor) => setAba(valor)}
        sx={{ mb: 2 }}
      >
        <Tab value="papeis" label="Papéis e Permissões" />
        <Tab value="conta" label="Minha Conta" />
      </Tabs>

      {ehPapeis ? (
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
            rows={papeis}
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
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            maxWidth: 480,
            borderRadius: 3,
            border: "1px solid #E5E7EB",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Meus dados
            </Typography>

            <BaseFormField label="Nome" value={user?.nome || ""} disabled />
            <BaseFormField label="E-mail" value={user?.email || ""} disabled />

            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>
              Trocar senha
            </Typography>

            <BaseFormField
              label="Senha atual"
              name="senhaAtual"
              type="password"
              value={formSenha.senhaAtual}
              onChange={handleChangeSenha}
              required
            />

            <BaseFormField
              label="Nova senha"
              name="novaSenha"
              type="password"
              value={formSenha.novaSenha}
              onChange={handleChangeSenha}
              required
            />

            <BaseFormField
              label="Confirmar nova senha"
              name="confirmarNovaSenha"
              type="password"
              value={formSenha.confirmarNovaSenha}
              onChange={handleChangeSenha}
              required
            />

            <Button
              variant="contained"
              onClick={trocarSenha}
              sx={{ alignSelf: "flex-start" }}
            >
              Salvar nova senha
            </Button>
          </Stack>
        </Paper>
      )}

      <PapelForm
        open={openPapelForm}
        papel={papelSelecionado}
        onClose={() => {
          setOpenPapelForm(false);
          setPapelSelecionado(null);
        }}
        onSave={salvarPapel}
      />

      <BaseDialog
        open={Boolean(papelPermissoesAberto)}
        onClose={() => setPapelPermissoesAberto(null)}
        onSave={salvarPermissoes}
        title={`Permissões — ${papelPermissoesAberto?.nome || ""}`}
      >
        <Stack spacing={1}>
          {permissoes.map((permissao) => (
            <FormControlLabel
              key={permissao.id}
              control={
                <Checkbox
                  checked={permissoesMarcadas.includes(permissao.id)}
                  onChange={(event) =>
                    alternarPermissao(permissao.id, event.target.checked)
                  }
                />
              }
              label={
                permissao.descricao
                  ? `${permissao.codigo} — ${permissao.descricao}`
                  : permissao.codigo
              }
            />
          ))}

          {permissoes.length === 0 && (
            <Typography color="text.secondary">
              Nenhuma permissão cadastrada no sistema.
            </Typography>
          )}
        </Stack>
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

export default Configuracoes;
