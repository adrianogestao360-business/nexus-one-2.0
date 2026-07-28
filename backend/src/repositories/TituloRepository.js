const prisma = require("../config/prisma");

class TituloRepository {
  async listar(empresaId, filtros = {}) {
    const { tipo, status, dataInicio, dataFim } = filtros;

    return prisma.titulo.findMany({
      where: {
        empresaId,
        tipo: tipo || undefined,
        status: status || undefined,
        vencimento:
          dataInicio || dataFim
            ? {
                gte: dataInicio ? new Date(`${dataInicio}T00:00:00`) : undefined,
                lte: dataFim ? new Date(`${dataFim}T23:59:59`) : undefined,
              }
            : undefined,
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

  async baixar(id, contaBancariaId) {
    return prisma.titulo.update({
      where: {
        id,
      },
      data: {
        status: "paga",
        dataPagamento: new Date(),
        contaBancariaId,
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
