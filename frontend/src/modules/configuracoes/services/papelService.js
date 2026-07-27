import api from "../../../services/api";

const papelService = {
  listar: async () => {
    const response = await api.get("/papeis");
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/papeis/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/papeis", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/papeis/${id}`, dados);
    return response.data;
  },

  definirPermissoes: async (id, permissaoIds) => {
    const response = await api.put(`/papeis/${id}/permissoes`, {
      permissaoIds,
    });
    return response.data;
  },

  excluir: async (id) => {
    await api.delete(`/papeis/${id}`);
  },
};

export default papelService;
