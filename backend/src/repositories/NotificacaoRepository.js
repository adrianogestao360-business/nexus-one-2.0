const prisma = require("../config/prisma");

class NotificacaoRepository {
  async listarTitulosVencendo(empresaId, dataLimite) {
    return prisma.titulo.findMany({
      where: {
        empresaId,
        status: "aberta",
        vencimento: {
          lte: dataLimite,
        },
      },
      orderBy: {
        vencimento: "asc",
      },
    });
  }

  async listarProdutosAtivos(empresaId) {
    return prisma.produto.findMany({
      where: {
        empresaId,
        ativo: true,
      },
    });
  }

  async listarEntregasEmRota(empresaId, dataLimite) {
    return prisma.entrega.findMany({
      where: {
        empresaId,
        status: "em_rota",
        dataSaida: {
          lte: dataLimite,
        },
      },
      orderBy: {
        dataSaida: "asc",
      },
    });
  }

  async listarChavesLidas(usuarioId) {
    return prisma.notificacaoLida.findMany({
      where: {
        usuarioId,
      },
      select: {
        chave: true,
      },
    });
  }

  async marcarComoLida(usuarioId, empresaId, chave) {
    return prisma.notificacaoLida.upsert({
      where: {
        usuarioId_chave: {
          usuarioId,
          chave,
        },
      },
      update: {},
      create: {
        usuarioId,
        empresaId,
        chave,
      },
    });
  }
}

module.exports = new NotificacaoRepository();
