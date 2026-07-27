import api from "../../../services/api";

const abastecimentoService = {
  listar: async (veiculoId) => {
    const response = await api.get(`/veiculos/${veiculoId}/abastecimentos`);
    return response.data;
  },

  criar: async (veiculoId, dados) => {
    const response = await api.post(
      `/veiculos/${veiculoId}/abastecimentos`,
      dados,
    );
    return response.data;
  },
};

export default abastecimentoService;
