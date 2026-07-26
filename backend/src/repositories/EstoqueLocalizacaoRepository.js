const prisma = require("../config/prisma");

class EstoqueLocalizacaoRepository {
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
