const prisma = require("../config/prisma");

class RomaneioRepository {
  async listar(empresaId) {
    return prisma.romaneio.findMany({
      where: {
        empresaId,
      },
      include: this.#include(),
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.romaneio.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  async criar(data, tx = prisma) {
    return tx.romaneio.create({
      data,
    });
  }

  #include() {
    return {
      veiculo: true,
      motorista: true,
      separacao: {
        include: {
          venda: {
            include: { cliente: true },
          },
          itens: {
            include: { produto: true },
          },
        },
      },
    };
  }
}

module.exports = new RomaneioRepository();
