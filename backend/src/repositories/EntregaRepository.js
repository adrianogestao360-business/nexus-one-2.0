const prisma = require("../config/prisma");

class EntregaRepository {
  async listar(empresaId, status) {
    return prisma.entrega.findMany({
      where: {
        empresaId,
        status: status || undefined,
      },
      include: this.#include(),
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.entrega.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  async criar(data) {
    return prisma.entrega.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.entrega.update({
      where: {
        id,
      },
      data,
    });
  }

  #include() {
    return {
      separacao: {
        include: {
          venda: {
            include: {
              cliente: true,
            },
          },
        },
      },
      veiculo: true,
      motorista: true,
    };
  }
}

module.exports = new EntregaRepository();
