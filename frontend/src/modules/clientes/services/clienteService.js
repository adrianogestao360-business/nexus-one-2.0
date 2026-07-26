import api from "../../../services/api";

const clienteService = {
  listar: async () => {
    const response = await api.get("/clientes");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/clientes", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/clientes/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/clientes/${id}`);
  },
};

export default clienteService;
