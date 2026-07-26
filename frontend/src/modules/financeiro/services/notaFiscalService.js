import api from "../../../services/api";

const notaFiscalService = {
  listar: async () => {
    const response = await api.get("/notas-fiscais");
    return response.data;
  },

  emitir: async (id, numero) => {
    const response = await api.post(`/notas-fiscais/${id}/emitir`, {
      numero,
    });
    return response.data;
  },

  cancelar: async (id) => {
    const response = await api.post(`/notas-fiscais/${id}/cancelar`);
    return response.data;
  },
};

export default notaFiscalService;
