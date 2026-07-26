import api from "../../../services/api";

const usuarioService = {
  listar: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/usuarios", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/usuarios/${id}`);
  },
};

export default usuarioService;
