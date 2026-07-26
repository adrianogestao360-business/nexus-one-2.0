import api from "../../../services/api";

const tituloService = {
  listar: async (tipo) => {
    const response = await api.get("/titulos", { params: { tipo } });
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/titulos", dados);
    return response.data;
  },

  baixar: async (id) => {
    const response = await api.patch(`/titulos/${id}/baixar`);
    return response.data;
  },

  cancelar: async (id) => {
    await api.delete(`/titulos/${id}`);
  },
};

export default tituloService;
