const prisma = require("../config/prisma");

class ProdutoRepository {
  async listar(empresaId) {
    return prisma.produto.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.produto.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async criar(data) {
    return prisma.produto.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.produto.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.produto.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new ProdutoRepository();
