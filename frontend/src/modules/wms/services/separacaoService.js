import api from "../../../services/api";

const separacaoService = {
  listar: async (status) => {
    const response = await api.get("/separacoes", { params: { status } });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/separacoes/${id}`);
    return response.data;
  },

  assumir: async (id) => {
    const response = await api.post(`/separacoes/${id}/assumir`);
    return response.data;
  },

  liberar: async (id) => {
    const response = await api.post(`/separacoes/${id}/liberar`);
    return response.data;
  },

  marcarItem: async (id, itemId, separado) => {
    const response = await api.patch(`/separacoes/${id}/itens/${itemId}`, {
      separado,
    });
    return response.data;
  },

  concluir: async (id) => {
    const response = await api.post(`/separacoes/${id}/concluir`);
    return response.data;
  },

  expedir: async (id, veiculoId, motoristaId, volumes) => {
    const response = await api.post(`/separacoes/${id}/expedir`, {
      veiculoId,
      motoristaId,
      volumes,
    });
    return response.data;
  },
};

export default separacaoService;
