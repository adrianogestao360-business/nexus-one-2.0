import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

import BasePage from "../../../components/BasePage/BasePage";
import BaseCrudTable from "../../../components/BaseCrudTable/BaseCrudTable";
import UsuarioForm from "../../../components/UsuarioForm/UsuarioForm";

import usuarioService from "../services/usuarioService";

function Usuarios() {
  const [rows, setRows] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const columns = [
    {
      field: "nome",
      headerName: "Nome",
      flex: 2,
    },
    {
      field: "email",
      headerName: "E-mail",
      flex: 2,
    },
    {
      field: "papel",
      headerName: "Papéis",
      flex: 1,
      valueGetter: (_value, row) =>
        row.papeis?.map((papel) => papel.nome).join(", ") || "-",
    },
    {
      field: "ativo",
      headerName: "Ativo",
      flex: 1,
      valueGetter: (value) => (value ? "Sim" : "Não"),
    },
  ];

  async function carregarUsuarios() {
    try {
      const usuarios = await usuarioService.listar();
      setRows(usuarios);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao carregar usuários.");
    }
  }

  async function salvarUsuario(dados) {
    try {
      if (usuarioSelecionado) {
        await usuarioService.atualizar(usuarioSelecionado.id, dados);
        setMensagem("Usuário atualizado com sucesso.");
      } else {
        await usuarioService.criar(dados);
        setMensagem("Usuário cadastrado com sucesso.");
      }

      await carregarUsuarios();

      setOpenForm(false);
      setUsuarioSelecionado(null);
      setTipoMensagem("success");
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao salvar usuário.");

      throw error;
    }
  }

  async function desativarUsuario(id) {
    try {
      await usuarioService.desativar(id);
      await carregarUsuarios();

      setTipoMensagem("success");
      setMensagem("Usuário desativado com sucesso.");
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);

      setTipoMensagem("error");
      setMensagem("Erro ao desativar usuário.");
    }
  }

  function editarUsuario(usuario) {
    setUsuarioSelecionado(usuario);
    setOpenForm(true);
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <BasePage
      title="Usuários"
      subtitle="Cadastro de Usuários"
      buttonLabel="Novo Usuário"
      onButtonClick={() => {
        setUsuarioSelecionado(null);
        setOpenForm(true);
      }}
    >
      <BaseCrudTable
        rows={rows}
        columns={columns}
        onEdit={editarUsuario}
        onDelete={desativarUsuario}
      />

      <UsuarioForm
        open={openForm}
        usuario={usuarioSelecionado}
        onClose={() => {
          setOpenForm(false);
          setUsuarioSelecionado(null);
        }}
        onSave={salvarUsuario}
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

export default Usuarios;
