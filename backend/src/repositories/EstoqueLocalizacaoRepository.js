const prisma = require("../config/prisma");

class EstoqueLocalizacaoRepository {
  async listar(empresaId) {
    return prisma.estoqueLocalizacao.findMany({
      where: {
        empresaId,
      },
      include: {
        produto: true,
        localizacao: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async listarPorProduto(produtoId, empresaId) {
    return prisma.estoqueLocalizacao.findMany({
      where: {
        produtoId,
        empresaId,
      },
      include: {
        localizacao: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }
}

module.exports = new EstoqueLocalizacaoRepository();
