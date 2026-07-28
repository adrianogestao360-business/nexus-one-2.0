import api from "../../../services/api";

const conferenciaService = {
  abrir: async (compraId, dados) => {
    const response = await api.post(`/compras/${compraId}/conferencia`, dados);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/conferencias/${id}`);
    return response.data;
  },

  registrarRecebimento: async (conferenciaId, itemId, quantidadeRecebida) => {
    const response = await api.put(
      `/conferencias/${conferenciaId}/itens/${itemId}`,
      { quantidadeRecebida },
    );
    return response.data;
  },

  concluir: async (id) => {
    const response = await api.post(`/conferencias/${id}/concluir`);
    return response.data;
  },
};

export default conferenciaService;
