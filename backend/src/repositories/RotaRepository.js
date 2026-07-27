const prisma = require("../config/prisma");

class RotaRepository {
  async listar(empresaId, status) {
    return prisma.rota.findMany({
      where: {
        empresaId,
        status: status || undefined,
      },
      include: this.#include(),
      orderBy: {
        iniciadaEm: "desc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.rota.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        ...this.#include(),
        posicoes: {
          orderBy: { registradoEm: "asc" },
        },
      },
    });
  }

  async findByToken(token) {
    return prisma.rota.findUnique({
      where: {
        tokenRastreio: token,
      },
      include: this.#include(),
    });
  }

  async criar(data) {
    return prisma.rota.create({
      data,
      include: this.#include(),
    });
  }

  async atualizar(id, data) {
    return prisma.rota.update({
      where: {
        id,
      },
      data,
      include: this.#include(),
    });
  }

  #include() {
    return {
      veiculo: true,
      motorista: true,
      entregas: {
        include: {
          separacao: {
            include: {
              venda: {
                include: {
                  cliente: true,
                },
              },
            },
          },
        },
      },
    };
  }
}

module.exports = new RotaRepository();
