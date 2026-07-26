const prisma = require("../config/prisma");

class NotaFiscalRepository {
  async listar(empresaId, status) {
    return prisma.notaFiscal.findMany({
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
    return prisma.notaFiscal.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  async atualizar(id, data) {
    return prisma.notaFiscal.update({
      where: {
        id,
      },
      data,
    });
  }

  #include() {
    return {
      venda: {
        include: {
          cliente: true,
        },
      },
      compra: {
        include: {
          fornecedor: true,
        },
      },
    };
  }
}

module.exports = new NotaFiscalRepository();
