const RomaneioRepository = require("../repositories/RomaneioRepository");

class RomaneioService {
  async listar(empresaId) {
    return RomaneioRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const romaneio = await RomaneioRepository.findById(id, empresaId);

    if (!romaneio) {
      const error = new Error("Romaneio não encontrado.");
      error.status = 404;
      throw error;
    }

    return romaneio;
  }
}

module.exports = new RomaneioService();
