const prisma = require("../config/prisma");

class DreService {
  async gerar(empresaId, filtros = {}) {
    const periodo = this.#periodo(filtros);

    const [vendas, compras, titulosAvulsos, folhas] = await Promise.all([
      prisma.venda.findMany({
        where: {
          empresaId,
          status: "confirmada",
          ...(periodo ? { createdAt: periodo } : {}),
        },
        select: { total: true },
      }),
      prisma.compra.findMany({
        where: {
          empresaId,
          status: { not: "cancelada" },
          ...(periodo ? { createdAt: periodo } : {}),
        },
        select: { total: true },
      }),
      prisma.titulo.findMany({
        where: {
          empresaId,
          tipo: "pagar",
          compraId: null,
          folhaPagamentoItemId: null,
          status: { not: "cancelada" },
          ...(periodo ? { createdAt: periodo } : {}),
        },
        select: { valor: true },
      }),
      prisma.folhaPagamento.findMany({
        where: { empresaId, status: "fechada" },
        include: { itens: true },
      }),
    ]);

    const receitaBruta = this.#somar(vendas, "total");
    const custoMercadorias = this.#somar(compras, "total");
    const outrasDespesasOperacionais = this.#somar(titulosAvulsos, "valor");

    const folhasNoPeriodo = folhas.filter((folha) =>
      this.#folhaNoPeriodo(folha, filtros),
    );
    const despesasPessoal = folhasNoPeriodo.reduce(
      (soma, folha) => soma + this.#somar(folha.itens, "valorLiquido"),
      0,
    );

    const lucroBruto = receitaBruta - custoMercadorias;
    const lucroLiquido = lucroBruto - despesasPessoal - outrasDespesasOperacionais;

    return {
      periodo: {
        dataInicio: filtros.dataInicio || null,
        dataFim: filtros.dataFim || null,
      },
      receitaBruta,
      custoMercadorias,
      lucroBruto,
      despesasPessoal,
      outrasDespesasOperacionais,
      lucroLiquido,
    };
  }

  #periodo({ dataInicio, dataFim }) {
    if (!dataInicio && !dataFim) {
      return null;
    }

    const filtro = {};

    if (dataInicio) {
      filtro.gte = new Date(dataInicio);
    }

    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      filtro.lte = fim;
    }

    return filtro;
  }

  #folhaNoPeriodo(folha, { dataInicio, dataFim }) {
    const dataFolha = new Date(folha.ano, folha.mes - 1, 1);

    if (dataInicio && dataFolha < new Date(dataInicio)) {
      return false;
    }

    if (dataFim && dataFolha > new Date(dataFim)) {
      return false;
    }

    return true;
  }

  #somar(linhas, campo) {
    return linhas.reduce((soma, linha) => soma + Number(linha[campo]), 0);
  }
}

module.exports = new DreService();
