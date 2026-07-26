const prisma = require("../config/prisma");

class DashboardService {
  async obterDashboard(empresaId) {
    const [resumo, faturamentoMensal, atividadesRecentes] =
      await Promise.all([
        this.#obterResumo(empresaId),
        this.#obterFaturamentoMensal(empresaId),
        this.#obterAtividadesRecentes(empresaId),
      ]);

    return { resumo, faturamentoMensal, atividadesRecentes };
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
}

module.exports = new DashboardService();
