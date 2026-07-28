import api from "../../../services/api";

const estoqueLocalizacaoService = {
  listar: async () => {
    const response = await api.get("/estoque-localizacoes");
    return response.data;
  },
};

export default estoqueLocalizacaoService;
