const EstoqueLocalizacaoRepository = require("../repositories/EstoqueLocalizacaoRepository");

class EstoqueLocalizacaoService {
  async listar(empresaId) {
    return EstoqueLocalizacaoRepository.listar(empresaId);
  }

  async listarPorProduto(produtoId, empresaId) {
    if (!produtoId) {
      const error = new Error("produtoId é obrigatório.");
      error.status = 400;
      throw error;
    }

    return EstoqueLocalizacaoRepository.listarPorProduto(
      Number(produtoId),
      empresaId,
    );
  }
}

module.exports = new EstoqueLocalizacaoService();
