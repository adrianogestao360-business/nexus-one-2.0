const NotificacaoRepository = require("../repositories/NotificacaoRepository");

const DIAS_ANTECEDENCIA_VENCIMENTO = 3;
const HORAS_ATRASO_ENTREGA = 24;
const DIAS_ANTECEDENCIA_VALIDADE = 7;

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

class NotificacaoService {
  async listar(usuarioId, empresaId) {
    const agora = new Date();

    const limiteVencimento = new Date(agora);
    limiteVencimento.setDate(
      limiteVencimento.getDate() + DIAS_ANTECEDENCIA_VENCIMENTO,
    );

    const limiteAtrasoEntrega = new Date(
      agora.getTime() - HORAS_ATRASO_ENTREGA * 60 * 60 * 1000,
    );

    const limiteValidade = new Date(agora);
    limiteValidade.setDate(
      limiteValidade.getDate() + DIAS_ANTECEDENCIA_VALIDADE,
    );

    const [titulos, produtos, entregas, lotes, lidas] = await Promise.all([
      NotificacaoRepository.listarTitulosVencendo(
        empresaId,
        limiteVencimento,
      ),
      NotificacaoRepository.listarProdutosAtivos(empresaId),
      NotificacaoRepository.listarEntregasEmRota(
        empresaId,
        limiteAtrasoEntrega,
      ),
      NotificacaoRepository.listarLotesVencendo(empresaId, limiteValidade),
      NotificacaoRepository.listarChavesLidas(usuarioId),
    ]);

    const chavesLidas = new Set(lidas.map((item) => item.chave));

    const notificacoes = [];

    for (const titulo of titulos) {
      const vencido = new Date(titulo.vencimento) < agora;

      notificacoes.push({
        chave: `titulo:${titulo.id}`,
        tipo: "titulo_vencendo",
        severidade: vencido ? "error" : "warning",
        mensagem: vencido
          ? `Título "${titulo.descricao}" está vencido desde ${formatarData(titulo.vencimento)}.`
          : `Título "${titulo.descricao}" vence em ${formatarData(titulo.vencimento)}.`,
      });
    }

    for (const produto of produtos) {
      if (produto.estoque > produto.estoqueMinimo) {
        continue;
      }

      notificacoes.push({
        chave: `estoque:${produto.id}`,
        tipo: "estoque_baixo",
        severidade: "warning",
        mensagem: `Estoque baixo: ${produto.descricao} (${produto.estoque} un., mínimo ${produto.estoqueMinimo}).`,
      });
    }

    for (const entrega of entregas) {
      notificacoes.push({
        chave: `entrega:${entrega.id}`,
        tipo: "entrega_atrasada",
        severidade: "error",
        mensagem: `Entrega #${entrega.id} está em rota desde ${formatarData(entrega.dataSaida)} sem confirmação.`,
      });
    }

    for (const lote of lotes) {
      const vencido = new Date(lote.dataValidade) < agora;

      notificacoes.push({
        chave: `lote:${lote.id}`,
        tipo: "lote_vencendo",
        severidade: vencido ? "error" : "warning",
        mensagem: vencido
          ? `Lote "${lote.numero}" de ${lote.produto.descricao} está vencido desde ${formatarData(lote.dataValidade)}.`
          : `Lote "${lote.numero}" de ${lote.produto.descricao} vence em ${formatarData(lote.dataValidade)}.`,
      });
    }

    return notificacoes
      .filter((notificacao) => !chavesLidas.has(notificacao.chave))
      .sort((a, b) =>
        a.severidade === b.severidade ? 0 : a.severidade === "error" ? -1 : 1,
      );
  }

  async marcarComoLida(chave, usuarioId, empresaId) {
    if (!chave) {
      const error = new Error("Chave da notificação é obrigatória.");
      error.status = 400;
      throw error;
    }

    return NotificacaoRepository.marcarComoLida(usuarioId, empresaId, chave);
  }
}

module.exports = new NotificacaoService();
