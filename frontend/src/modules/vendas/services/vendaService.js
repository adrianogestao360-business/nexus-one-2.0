import api from "../../../services/api";

const vendaService = {
  listar: async () => {
    const response = await api.get("/vendas");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/vendas", dados);
    return response.data;
  },

  cancelar: async (id) => {
    await api.delete(`/vendas/${id}`);
  },
};

export default vendaService;
