import api from "../../../services/api";

const auditoriaService = {
  listar: async (filtros) => {
    const response = await api.get("/auditoria", { params: filtros });
    return response.data;
  },
};

export default auditoriaService;
