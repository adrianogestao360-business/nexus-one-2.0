const prisma = require("../config/prisma");

class ConferenciaRepository {
  async listar(empresaId) {
    return prisma.conferencia.findMany({
      where: {
        empresaId,
      },
      include: {
        compra: {
          include: { fornecedor: true },
        },
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
    return prisma.conferencia.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        compra: {
          include: { fornecedor: true },
        },
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

  async findAbertaPorCompra(compraId, empresaId) {
    return prisma.conferencia.findFirst({
      where: {
        compraId,
        empresaId,
        status: "aberta",
      },
    });
  }

  async criar(data, itens, tx = prisma) {
    return tx.conferencia.create({
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
    return tx.conferencia.update({
      where: { id },
      data: {
        status,
        concluidaEm: status === "concluida" ? new Date() : null,
      },
    });
  }

  async findItemById(id, conferenciaId, tx = prisma) {
    return tx.conferenciaItem.findFirst({
      where: { id, conferenciaId },
    });
  }

  async atualizarRecebimento(id, quantidadeRecebida, tx = prisma) {
    return tx.conferenciaItem.update({
      where: { id },
      data: {
        quantidadeRecebida,
        conferidoEm: new Date(),
      },
    });
  }
}

module.exports = new ConferenciaRepository();
