const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");

class LocalizacaoService {
  async listar(empresaId) {
    return LocalizacaoRepository.listar(empresaId);
  }

  async criar(data, empresaId) {
    if (!data.codigo) {
      const error = new Error("Código é obrigatório.");
      error.status = 400;
      throw error;
    }

    return LocalizacaoRepository.criar({
      codigo: data.codigo,
      zonaId: data.zonaId ? Number(data.zonaId) : null,
      empresaId,
    });
  }
}

module.exports = new LocalizacaoService();
