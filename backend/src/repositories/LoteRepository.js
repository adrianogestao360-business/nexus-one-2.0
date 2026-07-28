const prisma = require("../config/prisma");

class LoteRepository {
  async listar(empresaId, filtros = {}) {
    const { produtoId } = filtros;

    return prisma.lote.findMany({
      where: {
        empresaId,
        ativo: true,
        produtoId: produtoId ? Number(produtoId) : undefined,
      },
      include: {
        produto: true,
      },
      orderBy: [{ dataValidade: "asc" }, { id: "asc" }],
    });
  }

  async listarDisponiveisFEFO(produtoId, empresaId, tx = prisma) {
    return tx.lote.findMany({
      where: {
        produtoId,
        empresaId,
        ativo: true,
        quantidade: { gt: 0 },
      },
      orderBy: [
        { dataValidade: { sort: "asc", nulls: "last" } },
        { createdAt: "asc" },
      ],
    });
  }

  async findByNumero(produtoId, numero, empresaId, tx = prisma) {
    return tx.lote.findFirst({
      where: {
        produtoId,
        numero,
        empresaId,
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.lote.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        produto: true,
      },
    });
  }

  async criar(data, tx = prisma) {
    return tx.lote.create({
      data,
    });
  }

  async incrementar(id, quantidade, tx = prisma) {
    return tx.lote.update({
      where: { id },
      data: { quantidade: { increment: quantidade } },
    });
  }

  async decrementar(id, quantidade, tx = prisma) {
    return tx.lote.update({
      where: { id },
      data: { quantidade: { decrement: quantidade } },
    });
  }
}

module.exports = new LoteRepository();
