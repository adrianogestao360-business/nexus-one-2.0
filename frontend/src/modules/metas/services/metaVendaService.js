import api from "../../../services/api";

const metaVendaService = {
  listar: async () => {
    const response = await api.get("/metas-vendas");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/metas-vendas", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/metas-vendas/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    await api.delete(`/metas-vendas/${id}`);
  },
};

export default metaVendaService;
