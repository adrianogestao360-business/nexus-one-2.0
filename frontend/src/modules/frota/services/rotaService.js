import api from "../../../services/api";

const rotaService = {
  listar: async (status) => {
    const response = await api.get("/rotas", { params: { status } });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/rotas/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/rotas", dados);
    return response.data;
  },

  concluir: async (id) => {
    const response = await api.post(`/rotas/${id}/concluir`);
    return response.data;
  },
};

export default rotaService;
