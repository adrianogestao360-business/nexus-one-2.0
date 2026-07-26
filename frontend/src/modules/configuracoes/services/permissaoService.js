import api from "../../../services/api";

const permissaoService = {
  listar: async () => {
    const response = await api.get("/permissoes");
    return response.data;
  },
};

export default permissaoService;
