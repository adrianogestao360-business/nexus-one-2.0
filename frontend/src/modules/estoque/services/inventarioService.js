import api from "../../../services/api";

const inventarioService = {
  listar: async () => {
    const response = await api.get("/inventarios");
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/inventarios/${id}`);
    return response.data;
  },

  abrir: async (dados) => {
    const response = await api.post("/inventarios", dados);
    return response.data;
  },

  registrarContagem: async (inventarioId, itemId, quantidadeContada) => {
    const response = await api.put(
      `/inventarios/${inventarioId}/itens/${itemId}`,
      { quantidadeContada },
    );
    return response.data;
  },

  fechar: async (id) => {
    const response = await api.post(`/inventarios/${id}/fechar`);
    return response.data;
  },
};

export default inventarioService;
