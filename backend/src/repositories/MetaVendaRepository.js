const prisma = require("../config/prisma");

class MetaVendaRepository {
  async listar(empresaId) {
    return prisma.metaVenda.findMany({
      where: {
        empresaId,
      },
      include: {
        usuario: true,
      },
      orderBy: [{ ano: "desc" }, { mes: "desc" }],
    });
  }

  async findById(id, empresaId) {
    return prisma.metaVenda.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        usuario: true,
      },
    });
  }

  async findByUsuarioMesAno(usuarioId, mes, ano) {
    return prisma.metaVenda.findUnique({
      where: {
        usuarioId_mes_ano: {
          usuarioId,
          mes,
          ano,
        },
      },
    });
  }

  async criar(data) {
    return prisma.metaVenda.create({
      data,
      include: {
        usuario: true,
      },
    });
  }

  async atualizar(id, data) {
    return prisma.metaVenda.update({
      where: {
        id,
      },
      data,
      include: {
        usuario: true,
      },
    });
  }

  async excluir(id) {
    return prisma.metaVenda.delete({
      where: {
        id,
      },
    });
  }

  async somarVendasConfirmadas(usuarioId, empresaId, inicio, fim) {
    const resultado = await prisma.venda.aggregate({
      where: {
        vendedorId: usuarioId,
        empresaId,
        status: "confirmada",
        createdAt: {
          gte: inicio,
          lt: fim,
        },
      },
      _sum: {
        total: true,
      },
    });

    return Number(resultado._sum.total || 0);
  }
}

module.exports = new MetaVendaRepository();
