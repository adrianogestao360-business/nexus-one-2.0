const prisma = require("../config/prisma");

class MotoristaRepository {
  async listar(empresaId) {
    return prisma.motorista.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.motorista.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async criar(data) {
    return prisma.motorista.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.motorista.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.motorista.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new MotoristaRepository();
