import api from "../../../services/api";

const dreService = {
  gerar: async (filtros) => {
    const response = await api.get("/relatorios/dre", { params: filtros });
    return response.data;
  },
};

export default dreService;
