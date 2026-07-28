const prisma = require("../config/prisma");

class InventarioRepository {
  async listar(empresaId) {
    return prisma.inventario.findMany({
      where: {
        empresaId,
      },
      include: {
        localizacao: true,
        produto: true,
        criadoPor: true,
        _count: {
          select: { itens: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.inventario.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        localizacao: true,
        produto: true,
        criadoPor: true,
        itens: {
          include: {
            produto: true,
            localizacao: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  async listarEstoqueParaSnapshot(empresaId, { localizacaoId, produtoId }) {
    return prisma.estoqueLocalizacao.findMany({
      where: {
        empresaId,
        quantidade: { gt: 0 },
        localizacaoId: localizacaoId || undefined,
        produtoId: produtoId || undefined,
      },
    });
  }

  async criar(data, itens, tx = prisma) {
    return tx.inventario.create({
      data: {
        ...data,
        itens: {
          create: itens,
        },
      },
      include: {
        itens: true,
      },
    });
  }

  async atualizarStatus(id, status, tx = prisma) {
    return tx.inventario.update({
      where: { id },
      data: {
        status,
        fechadoEm: status === "fechado" ? new Date() : null,
      },
    });
  }

  async findItemById(id, inventarioId, tx = prisma) {
    return tx.inventarioItem.findFirst({
      where: { id, inventarioId },
    });
  }

  async atualizarContagem(id, quantidadeContada, tx = prisma) {
    return tx.inventarioItem.update({
      where: { id },
      data: {
        quantidadeContada,
        contadoEm: new Date(),
      },
    });
  }
}

module.exports = new InventarioRepository();
