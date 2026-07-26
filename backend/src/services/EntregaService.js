const EntregaRepository = require("../repositories/EntregaRepository");

class EntregaService {
  async listar(empresaId, status) {
    return EntregaRepository.listar(empresaId, status);
  }

  async buscarPorId(id, empresaId) {
    const entrega = await EntregaRepository.findById(id, empresaId);

    if (!entrega) {
      throw this.#naoEncontrada();
    }

    return entrega;
  }

  async confirmar(id, empresaId) {
    const entrega = await this.buscarPorId(id, empresaId);

    if (entrega.status !== "em_rota") {
      const error = new Error(
        "Só é possível confirmar uma entrega que está em rota.",
      );
      error.status = 400;
      throw error;
    }

    return EntregaRepository.atualizar(id, {
      status: "entregue",
      dataEntrega: new Date(),
    });
  }

  #naoEncontrada() {
    const error = new Error("Entrega não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new EntregaService();
