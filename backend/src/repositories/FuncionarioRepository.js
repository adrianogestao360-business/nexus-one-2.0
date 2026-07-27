const prisma = require("../config/prisma");

class FuncionarioRepository {
  async listar(empresaId) {
    return prisma.funcionario.findMany({
      where: {
        empresaId,
      },
      include: {
        cargo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.funcionario.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        cargo: true,
      },
    });
  }

  async criar(data) {
    return prisma.funcionario.create({
      data,
      include: {
        cargo: true,
      },
    });
  }

  async atualizar(id, data) {
    return prisma.funcionario.update({
      where: {
        id,
      },
      data,
      include: {
        cargo: true,
      },
    });
  }

  async desativar(id) {
    return prisma.funcionario.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new FuncionarioRepository();
