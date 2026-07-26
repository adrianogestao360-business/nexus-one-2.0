const prisma = require("../config/prisma");

class VendaRepository {
  async listar(empresaId) {
    return prisma.venda.findMany({
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
    return prisma.venda.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  #include() {
    return {
      cliente: true,
      itens: {
        include: {
          produto: true,
        },
      },
      movimentos: true,
    };
  }
}

module.exports = new VendaRepository();
