const prisma = require("../config/prisma");

class ClienteRepository {
  async listar(empresaId) {
    return prisma.cliente.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.cliente.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async criar(data) {
    return prisma.cliente.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.cliente.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.cliente.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new ClienteRepository();
