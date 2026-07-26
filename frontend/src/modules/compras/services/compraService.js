import api from "../../../services/api";

const compraService = {
  listar: async () => {
    const response = await api.get("/compras");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/compras", dados);
    return response.data;
  },

  cancelar: async (id) => {
    await api.delete(`/compras/${id}`);
  },
};

export default compraService;
