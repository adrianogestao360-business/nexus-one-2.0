import api from "../../../services/api";

const tituloService = {
  listar: async (filtros) => {
    const response = await api.get("/titulos", { params: filtros });
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/titulos", dados);
    return response.data;
  },

  baixar: async (id, contaBancariaId) => {
    const response = await api.patch(`/titulos/${id}/baixar`, {
      contaBancariaId,
    });
    return response.data;
  },

  cancelar: async (id) => {
    await api.delete(`/titulos/${id}`);
  },
};

export default tituloService;
