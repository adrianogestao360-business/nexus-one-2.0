import api from "../../../services/api";

const veiculoService = {
  listar: async () => {
    const response = await api.get("/veiculos");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/veiculos", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/veiculos/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/veiculos/${id}`);
  },
};

export default veiculoService;
