const prisma = require("../config/prisma");

class VendaRepository {
  async listar(empresaId, filtros = {}) {
    const { status, dataInicio, dataFim } = filtros;

    return prisma.venda.findMany({
      where: {
        empresaId,
        status: status || undefined,
        createdAt:
          dataInicio || dataFim
            ? {
                gte: dataInicio ? new Date(`${dataInicio}T00:00:00`) : undefined,
                lte: dataFim ? new Date(`${dataFim}T23:59:59`) : undefined,
              }
            : undefined,
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
