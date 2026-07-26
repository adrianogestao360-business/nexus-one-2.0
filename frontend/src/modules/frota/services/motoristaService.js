import api from "../../../services/api";

const motoristaService = {
  listar: async () => {
    const response = await api.get("/motoristas");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/motoristas", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/motoristas/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/motoristas/${id}`);
  },
};

export default motoristaService;
