import api from "../../../services/api";

const loteService = {
  listar: async (filtros) => {
    const response = await api.get("/lotes", { params: filtros });
    return response.data;
  },
};

export default loteService;
