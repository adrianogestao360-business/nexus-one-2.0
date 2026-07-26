const prisma = require("../config/prisma");

class TituloRepository {
  async listar(empresaId, tipo) {
    return prisma.titulo.findMany({
      where: {
        empresaId,
        tipo: tipo || undefined,
      },
      include: this.#include(),
      orderBy: {
        vencimento: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.titulo.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  async criar(data) {
    return prisma.titulo.create({
      data,
    });
  }

  async baixar(id) {
    return prisma.titulo.update({
      where: {
        id,
      },
      data: {
        status: "paga",
        dataPagamento: new Date(),
      },
    });
  }

  async cancelar(id) {
    return prisma.titulo.update({
      where: {
        id,
      },
      data: {
        status: "cancelada",
      },
    });
  }

  #include() {
    return {
      cliente: true,
      fornecedor: true,
    };
  }
}

module.exports = new TituloRepository();
