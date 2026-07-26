import api from "../../../services/api";

const movimentoEstoqueService = {
  listar: async (produtoId) => {
    const response = await api.get("/movimentos-estoque", {
      params: { produtoId },
    });
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/movimentos-estoque", dados);
    return response.data;
  },

  transferir: async (dados) => {
    const response = await api.post("/movimentos-estoque/transferir", dados);
    return response.data;
  },
};

export default movimentoEstoqueService;
