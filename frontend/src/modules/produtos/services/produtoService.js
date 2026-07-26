import api from "../../../services/api";

const produtoService = {
  listar: async () => {
    const response = await api.get("/produtos");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/produtos", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/produtos/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/produtos/${id}`);
  },
};

export default produtoService;
