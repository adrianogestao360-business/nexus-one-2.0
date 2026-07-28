const prisma = require("../config/prisma");

class MovimentoEstoqueRepository {
  async listar(empresaId, produtoId) {
    return prisma.movimentoEstoque.findMany({
      where: {
        empresaId,
        produtoId: produtoId || undefined,
      },
      include: {
        produto: true,
        localizacao: true,
        lote: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async criar(data) {
    return prisma.movimentoEstoque.create({
      data,
    });
  }
}

module.exports = new MovimentoEstoqueRepository();
