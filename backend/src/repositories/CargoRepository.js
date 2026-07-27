const prisma = require("../config/prisma");

class CargoRepository {
  async listar(empresaId) {
    return prisma.cargo.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.cargo.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async criar(data) {
    return prisma.cargo.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.cargo.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.cargo.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new CargoRepository();
