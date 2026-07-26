import api from "../../../services/api";

const oportunidadeService = {
  listar: async () => {
    const response = await api.get("/oportunidades");
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post("/oportunidades", dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/oportunidades/${id}`, dados);
    return response.data;
  },

  moverEstagio: async (id, estagio, motivoPerda) => {
    const response = await api.patch(`/oportunidades/${id}/estagio`, {
      estagio,
      motivoPerda,
    });
    return response.data;
  },
};

export default oportunidadeService;
