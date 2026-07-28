const LoteRepository = require("../repositories/LoteRepository");

class LoteService {
  async listar(empresaId, filtros) {
    return LoteRepository.listar(empresaId, filtros);
  }

  async resolverParaEntrada(tx, { produtoId, numero, dataValidade, empresaId }) {
    if (!numero) {
      const error = new Error(
        "Número do lote é obrigatório para produtos que controlam lote.",
      );
      error.status = 400;
      throw error;
    }

    const existente = await LoteRepository.findByNumero(
      produtoId,
      numero,
      empresaId,
      tx,
    );

    if (existente) {
      return existente;
    }

    return LoteRepository.criar(
      {
        produtoId,
        numero,
        empresaId,
        dataValidade: dataValidade ? new Date(dataValidade) : null,
      },
      tx,
    );
  }

  async resolverParaSaida(tx, { produtoId, numero, empresaId, quantidade }) {
    if (!numero) {
      const error = new Error(
        "Número do lote é obrigatório para produtos que controlam lote.",
      );
      error.status = 400;
      throw error;
    }

    const lote = await LoteRepository.findByNumero(
      produtoId,
      numero,
      empresaId,
      tx,
    );

    if (!lote) {
      const error = new Error(`Lote "${numero}" não encontrado para este produto.`);
      error.status = 404;
      throw error;
    }

    if (lote.quantidade < quantidade) {
      const error = new Error(
        `Estoque insuficiente no lote "${numero}" (disponível: ${lote.quantidade}).`,
      );
      error.status = 400;
      throw error;
    }

    return lote;
  }

  async resolverConsumoAutomatico(tx, { produtoId, quantidade, empresaId }) {
    const lotes = await LoteRepository.listarDisponiveisFEFO(
      produtoId,
      empresaId,
      tx,
    );

    let restante = quantidade;
    const alocacoes = [];

    for (const lote of lotes) {
      if (restante <= 0) {
        break;
      }

      const consumir = Math.min(lote.quantidade, restante);

      await LoteRepository.decrementar(lote.id, consumir, tx);

      alocacoes.push({ loteId: lote.id, quantidade: consumir });

      restante -= consumir;
    }

    if (restante > 0) {
      alocacoes.push({ loteId: null, quantidade: restante });
    }

    return alocacoes;
  }
}

module.exports = new LoteService();
