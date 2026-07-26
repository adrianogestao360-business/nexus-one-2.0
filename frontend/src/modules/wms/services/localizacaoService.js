import api from "../../../services/api";

const localizacaoService = {
  listar: async () => {
    const response = await api.get("/localizacoes");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/localizacoes", dados);
    return response.data;
  },
};

export default localizacaoService;
