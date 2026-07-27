import api from "./api";

const iaService = {
  obterResumo: async () => {
    const response = await api.get("/ia/resumo");
    return response.data;
  },

  gerarPlanoDeAcao: async () => {
    const response = await api.post("/ia/plano-de-acao");
    return response.data;
  },
};

export default iaService;
