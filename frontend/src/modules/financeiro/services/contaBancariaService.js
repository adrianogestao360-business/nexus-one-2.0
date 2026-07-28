import api from "../../../services/api";

const contaBancariaService = {
  listar: async () => {
    const response = await api.get("/contas-bancarias");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/contas-bancarias", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/contas-bancarias/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/contas-bancarias/${id}`);
  },
};

export default contaBancariaService;
