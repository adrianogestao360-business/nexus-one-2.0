const prisma = require("../config/prisma");

class CompraRepository {
  async listar(empresaId) {
    return prisma.compra.findMany({
      where: {
        empresaId,
      },
      include: this.#include(),
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.compra.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  #include() {
    return {
      fornecedor: true,
      itens: {
        include: {
          produto: true,
        },
      },
      movimentos: true,
    };
  }
}

module.exports = new CompraRepository();
