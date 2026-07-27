import api from "../../../services/api";

const cargoService = {
  listar: async () => {
    const response = await api.get("/cargos");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/cargos", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/cargos/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/cargos/${id}`);
  },
};

export default cargoService;
