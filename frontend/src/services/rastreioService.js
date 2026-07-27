import axios from "axios";

const rastreioApi = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const rastreioService = {
  obterRota: async (token) => {
    const response = await rastreioApi.get(`/rastreio/${token}`);
    return response.data;
  },

  registrarPosicao: async (token, latitude, longitude) => {
    await rastreioApi.post(`/rastreio/${token}/posicao`, {
      latitude,
      longitude,
    });
  },

  confirmarEntrega: async (token, entregaId) => {
    const response = await rastreioApi.post(
      `/rastreio/${token}/entregas/${entregaId}/confirmar`,
    );
    return response.data;
  },
};

export default rastreioService;
