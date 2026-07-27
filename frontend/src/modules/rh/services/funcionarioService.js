import api from "../../../services/api";

const funcionarioService = {
  listar: async () => {
    const response = await api.get("/funcionarios");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/funcionarios", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/funcionarios/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/funcionarios/${id}`);
  },
};

export default funcionarioService;
