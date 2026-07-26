const prisma = require("../config/prisma");

class OportunidadeRepository {
  async listar(empresaId) {
    return prisma.oportunidade.findMany({
      where: {
        empresaId,
      },
      include: {
        cliente: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.oportunidade.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        cliente: true,
      },
    });
  }

  async criar(data) {
    return prisma.oportunidade.create({
      data,
      include: {
        cliente: true,
      },
    });
  }

  async atualizar(id, data) {
    return prisma.oportunidade.update({
      where: {
        id,
      },
      data,
      include: {
        cliente: true,
      },
    });
  }
}

module.exports = new OportunidadeRepository();
