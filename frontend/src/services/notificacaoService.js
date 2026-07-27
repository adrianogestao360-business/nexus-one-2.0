import api from "./api";

const notificacaoService = {
  listar: async () => {
    const response = await api.get("/notificacoes");
    return response.data;
  },

  marcarComoLida: async (chave) => {
    await api.post("/notificacoes/marcar-lida", { chave });
  },
};

export default notificacaoService;
