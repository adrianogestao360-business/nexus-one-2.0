import api from "../../../services/api";

const fluxoCaixaService = {
  obter: async (filtros) => {
    const response = await api.get("/financeiro/fluxo-caixa", {
      params: filtros,
    });
    return response.data;
  },
};

export default fluxoCaixaService;
