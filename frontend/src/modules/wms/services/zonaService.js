import api from "../../../services/api";

const zonaService = {
  listar: async () => {
    const response = await api.get("/zonas");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/zonas", dados);
    return response.data;
  },
};

export default zonaService;
