const prisma = require("../config/prisma");

class VeiculoRepository {
  async listar(empresaId) {
    return prisma.veiculo.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.veiculo.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async criar(data) {
    return prisma.veiculo.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.veiculo.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.veiculo.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new VeiculoRepository();
