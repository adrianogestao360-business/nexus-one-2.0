const prisma = require("../config/prisma");
const DreService = require("./DreService");

class DashboardService {
  async obterDashboard(empresaId) {
    const [
      resumo,
      faturamentoMensal,
      atividadesRecentes,
      hoje,
      margemMesAtual,
      progresso,
      rotasAtivas,
    ] = await Promise.all([
      this.#obterResumo(empresaId),
      this.#obterFaturamentoMensal(empresaId),
      this.#obterAtividadesRecentes(empresaId),
      this.#obterHoje(empresaId),
      this.#obterMargemMesAtual(empresaId),
      this.#obterProgresso(empresaId),
      this.#obterRotasAtivas(empresaId),
    ]);

    return {
      resumo,
      faturamentoMensal,
      atividadesRecentes,
      hoje,
      margemMesAtual,
      progresso,
      rotasAtivas,
    };
  }

  async #obterResumo(empresaId) {
    const [totalProdutos, totalClientes, totalEntregas, vendas] =
      await Promise.all([
        prisma.produto.count({ where: { empresaId, ativo: true } }),
        prisma.cliente.count({ where: { empresaId, ativo: true } }),
        prisma.entrega.count({ where: { empresaId, status: "entregue" } }),
        prisma.venda.findMany({
          where: { empresaId, status: "confirmada" },
          select: { total: true },
        }),
      ]);

    const faturamentoTotal = vendas.reduce(
      (soma, venda) => soma + Number(venda.total),
      0,
    );

    return { totalProdutos, totalClientes, totalEntregas, faturamentoTotal };
  }

  async #obterFaturamentoMensal(empresaId) {
    const inicio = new Date();
    inicio.setMonth(inicio.getMonth() - 5);
    inicio.setDate(1);
    inicio.setHours(0, 0, 0, 0);

    const vendas = await prisma.venda.findMany({
      where: {
        empresaId,
        status: "confirmada",
        createdAt: { gte: inicio },
      },
      select: { total: true, createdAt: true },
    });

    const buckets = [];
    const cursor = new Date(inicio);

    for (let i = 0; i < 6; i++) {
      buckets.push({
        chave: `${cursor.getFullYear()}-${cursor.getMonth()}`,
        mes: cursor.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        total: 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const venda of vendas) {
      const chave = `${venda.createdAt.getFullYear()}-${venda.createdAt.getMonth()}`;
      const bucket = buckets.find((item) => item.chave === chave);

      if (bucket) {
        bucket.total += Number(venda.total);
      }
    }

    return buckets.map(({ mes, total }) => ({ mes, total }));
  }

  async #obterAtividadesRecentes(empresaId) {
    const [vendas, compras] = await Promise.all([
      prisma.venda.findMany({
        where: { empresaId },
        include: { cliente: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.compra.findMany({
        where: { empresaId },
        include: { fornecedor: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const eventos = [
      ...vendas.map((venda) => ({
        tipo: "venda",
        descricao: `Venda #${venda.id} para ${venda.cliente.nome}`,
        valor: Number(venda.total),
        data: venda.createdAt,
      })),
      ...compras.map((compra) => ({
        tipo: "compra",
        descricao: `Compra #${compra.id} de ${compra.fornecedor.nome}`,
        valor: Number(compra.total),
        data: compra.createdAt,
      })),
    ];

    eventos.sort((a, b) => new Date(b.data) - new Date(a.data));

    return eventos.slice(0, 8);
  }

  async #obterHoje(empresaId) {
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const inicioOntem = new Date(inicioHoje);
    inicioOntem.setDate(inicioOntem.getDate() - 1);

    const [vendasHoje, vendasOntem] = await Promise.all([
      prisma.venda.findMany({
        where: {
          empresaId,
          status: "confirmada",
          createdAt: { gte: inicioHoje },
        },
        select: { total: true },
      }),
      prisma.venda.findMany({
        where: {
          empresaId,
          status: "confirmada",
          createdAt: { gte: inicioOntem, lt: inicioHoje },
        },
        select: { total: true },
      }),
    ]);

    return {
      receita: vendasHoje.reduce((soma, v) => soma + Number(v.total), 0),
      pedidos: vendasHoje.length,
      receitaOntem: vendasOntem.reduce((soma, v) => soma + Number(v.total), 0),
      pedidosOntem: vendasOntem.length,
    };
  }

  async #obterMargemMesAtual(empresaId) {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const dre = await DreService.gerar(empresaId, {
      dataInicio: inicioMes,
      dataFim: fimMes,
    });

    return dre.receitaBruta > 0
      ? (dre.lucroLiquido / dre.receitaBruta) * 100
      : 0;
  }

  async #obterProgresso(empresaId) {
    const [
      separacaoTotal,
      separacaoConcluidas,
      entregasTotal,
      entregasNoPrazo,
      veiculosTotal,
      veiculosDisponiveis,
    ] = await Promise.all([
      prisma.separacao.count({ where: { empresaId } }),
      prisma.separacao.count({
        where: { empresaId, status: { in: ["separado", "expedido"] } },
      }),
      prisma.entrega.count({ where: { empresaId } }),
      prisma.entrega.count({ where: { empresaId, status: "entregue" } }),
      prisma.veiculo.count({ where: { empresaId, ativo: true } }),
      prisma.veiculo.count({
        where: { empresaId, ativo: true, status: "disponivel" },
      }),
    ]);

    return {
      separacao: { concluidas: separacaoConcluidas, total: separacaoTotal },
      entregas: { noPrazo: entregasNoPrazo, total: entregasTotal },
      frota: { disponiveis: veiculosDisponiveis, total: veiculosTotal },
    };
  }

  async #obterRotasAtivas(empresaId) {
    const rotas = await prisma.rota.findMany({
      where: {
        empresaId,
        status: "em_andamento",
        ultimaLatitude: { not: null },
      },
      select: {
        id: true,
        ultimaLatitude: true,
        ultimaLongitude: true,
        veiculo: { select: { placa: true } },
      },
    });

    return rotas.map((rota) => ({
      id: rota.id,
      latitude: rota.ultimaLatitude,
      longitude: rota.ultimaLongitude,
      placa: rota.veiculo.placa,
    }));
  }
}

module.exports = new DashboardService();
