const prisma = require("../config/prisma");

class SeparacaoRepository {
  async listar(empresaId, status) {
    return prisma.separacao.findMany({
      where: {
        empresaId,
        status: status || undefined,
      },
      include: this.#include(),
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.separacao.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  async atualizar(id, data) {
    return prisma.separacao.update({
      where: {
        id,
      },
      data,
      include: this.#include(),
    });
  }

  async atualizarItem(itemId, data) {
    return prisma.separacaoItem.update({
      where: {
        id: itemId,
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
      separador: {
        select: {
          id: true,
          nome: true,
        },
      },
      itens: {
        include: {
          produto: {
            include: {
              zona: true,
            },
          },
        },
      },
      romaneio: {
        include: {
          veiculo: true,
          motorista: true,
        },
      },
    };
  }
}

module.exports = new SeparacaoRepository();
