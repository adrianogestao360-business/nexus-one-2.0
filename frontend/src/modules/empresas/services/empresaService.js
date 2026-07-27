import api from "../../../services/api";

const empresaService = {
  listar: async () => {
    const response = await api.get("/empresas");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/empresas", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/empresas/${id}`, dados);
    return response.data;
  },

  desativar: async (id) => {
    await api.delete(`/empresas/${id}`);
  },

  buscarIntegracaoFiscal: async (id) => {
    const response = await api.get(`/empresas/${id}/integracao-fiscal`);
    return response.data;
  },

  salvarIntegracaoFiscal: async (id, dados) => {
    const response = await api.put(`/empresas/${id}/integracao-fiscal`, dados);
    return response.data;
  },
};

export default empresaService;