const prisma = require("../config/prisma");

class ZonaRepository {
  async listar(empresaId) {
    return prisma.zona.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async criar(data) {
    return prisma.zona.create({
      data,
    });
  }
}

module.exports = new ZonaRepository();
