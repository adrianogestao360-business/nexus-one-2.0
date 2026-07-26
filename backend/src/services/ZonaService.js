const ZonaRepository = require("../repositories/ZonaRepository");

class ZonaService {
  async listar(empresaId) {
    return ZonaRepository.listar(empresaId);
  }

  async criar(data, empresaId) {
    if (!data.nome) {
      const error = new Error("Nome é obrigatório.");
      error.status = 400;
      throw error;
    }

    return ZonaRepository.criar({
      nome: data.nome,
      empresaId,
    });
  }
}

module.exports = new ZonaService();
