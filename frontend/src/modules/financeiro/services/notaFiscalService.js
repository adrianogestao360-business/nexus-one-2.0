import api from "../../../services/api";

const notaFiscalService = {
  listar: async () => {
    const response = await api.get("/notas-fiscais");
    return response.data;
  },

  emitir: async (id) => {
    const response = await api.post(`/notas-fiscais/${id}/emitir`);
    return response.data;
  },

  atualizarStatus: async (id) => {
    const response = await api.post(`/notas-fiscais/${id}/atualizar-status`);
    return response.data;
  },

  cancelar: async (id, justificativa) => {
    const response = await api.post(`/notas-fiscais/${id}/cancelar`, {
      justificativa,
    });
    return response.data;
  },
};

export default notaFiscalService;
