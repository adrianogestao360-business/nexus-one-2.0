const NotaFiscalRepository = require("../repositories/NotaFiscalRepository");

class NotaFiscalService {
  async listar(empresaId, status) {
    return NotaFiscalRepository.listar(empresaId, status);
  }

  async buscarPorId(id, empresaId) {
    const notaFiscal = await NotaFiscalRepository.findById(id, empresaId);

    if (!notaFiscal) {
      throw this.#naoEncontrada();
    }

    return notaFiscal;
  }

  async emitir(id, empresaId, numero) {
    const notaFiscal = await this.buscarPorId(id, empresaId);

    if (!numero) {
      const error = new Error("Número de controle é obrigatório.");
      error.status = 400;
      throw error;
    }

    if (notaFiscal.status !== "pendente") {
      const error = new Error(
        "Só é possível emitir uma nota fiscal pendente.",
      );
      error.status = 400;
      throw error;
    }

    return NotaFiscalRepository.atualizar(id, {
      status: "emitida",
      numero,
      emitidaEm: new Date(),
    });
  }

  async cancelar(id, empresaId) {
    const notaFiscal = await this.buscarPorId(id, empresaId);

    if (notaFiscal.status === "cancelada") {
      const error = new Error("Nota fiscal já está cancelada.");
      error.status = 400;
      throw error;
    }

    return NotaFiscalRepository.atualizar(id, {
      status: "cancelada",
    });
  }

  #naoEncontrada() {
    const error = new Error("Nota fiscal não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new NotaFiscalService();
