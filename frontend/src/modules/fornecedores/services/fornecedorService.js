import api from "../../../services/api";

const fornecedorService = {
  listar: async () => {
    const response = await api.get("/fornecedores");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/fornecedores", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/fornecedores/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/fornecedores/${id}`);
  },
};

export default fornecedorService;
