import api from "../../../services/api";

const entregaService = {
  listar: async (status) => {
    const response = await api.get("/entregas", { params: { status } });
    return response.data;
  },

  confirmar: async (id) => {
    const response = await api.post(`/entregas/${id}/confirmar`);
    return response.data;
  },
};

export default entregaService;
