import api from "../../../services/api";

const minhaContaService = {
  trocarSenha: async (senhaAtual, novaSenha) => {
    await api.put("/minha-conta/senha", { senhaAtual, novaSenha });
  },
};

export default minhaContaService;
