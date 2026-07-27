const RotaService = require("./RotaService");
const EntregaRepository = require("../repositories/EntregaRepository");

class RastreioService {
  async obterRota(token) {
    const rota = await RotaService.obterQualquerPorToken(token);

    return {
      id: rota.id,
      status: rota.status,
      veiculo: rota.veiculo,
      motorista: rota.motorista,
      entregas: rota.entregas.map((entrega) => ({
        id: entrega.id,
        status: entrega.status,
        cliente: entrega.separacao?.venda?.cliente?.nome || "-",
      })),
    };
  }

  async registrarPosicao(token, latitude, longitude) {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      const error = new Error("Latitude e longitude são obrigatórias.");
      error.status = 400;
      throw error;
    }

    await RotaService.registrarPosicao(token, latitude, longitude);
  }

  async confirmarEntrega(token, entregaId) {
    const rota = await RotaService.obterPorToken(token);

    const entrega = rota.entregas.find((item) => item.id === entregaId);

    if (!entrega) {
      const error = new Error("Entrega não encontrada nesta rota.");
      error.status = 404;
      throw error;
    }

    if (entrega.status !== "em_rota") {
      const error = new Error(
        "Só é possível confirmar uma entrega que está em rota.",
      );
      error.status = 400;
      throw error;
    }

    const entregaAtualizada = await EntregaRepository.atualizar(entregaId, {
      status: "entregue",
      dataEntrega: new Date(),
    });

    const rotaAtualizada = await RotaService.buscarPorId(
      rota.id,
      rota.empresaId,
    );

    const todasEntregues = rotaAtualizada.entregas.every(
      (item) => item.status === "entregue",
    );

    if (todasEntregues) {
      await RotaService.concluir(rota.id, rota.empresaId);
    }

    return entregaAtualizada;
  }
}

module.exports = new RastreioService();
