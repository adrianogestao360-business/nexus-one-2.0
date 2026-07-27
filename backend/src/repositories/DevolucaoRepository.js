const prisma = require("../config/prisma");

class DevolucaoRepository {
  async listar(empresaId) {
    return prisma.devolucao.findMany({
      where: {
        empresaId,
      },
      include: this.#include(),
      orderBy: {
        id: "desc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.devolucao.findFirst({
      where: {
        id,
        empresaId,
      },
      include: this.#include(),
    });
  }

  async somarQuantidadeDevolvida(campo, referenciaId, produtoId) {
    const resultado = await prisma.devolucaoItem.aggregate({
      where: {
        produtoId,
        devolucao: {
          [campo]: referenciaId,
        },
      },
      _sum: {
        quantidade: true,
      },
    });

    return resultado._sum.quantidade || 0;
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
      itens: {
        include: {
          produto: true,
        },
      },
    };
  }
}

module.exports = new DevolucaoRepository();
