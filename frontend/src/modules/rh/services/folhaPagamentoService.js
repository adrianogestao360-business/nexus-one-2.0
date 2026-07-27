import api from "../../../services/api";

const folhaPagamentoService = {
  listar: async () => {
    const response = await api.get("/folhas-pagamento");
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/folhas-pagamento/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/folhas-pagamento", dados);
    return response.data;
  },

  atualizarItem: async (itemId, dados) => {
    const response = await api.put(`/folhas-pagamento/itens/${itemId}`, dados);
    return response.data;
  },

  fechar: async (id) => {
    const response = await api.post(`/folhas-pagamento/${id}/fechar`);
    return response.data;
  },
};

export default folhaPagamentoService;
