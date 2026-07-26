const prisma = require("../config/prisma");

class EmpresaRepository {
  async findAll() {
    return prisma.empresa.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  async create(data) {
    return prisma.empresa.create({
      data,
    });
  }

  async findById(id) {
    return prisma.empresa.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id, data) {
    return prisma.empresa.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.empresa.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new EmpresaRepository();
