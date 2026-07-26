const prisma = require("../config/prisma");

class FornecedorRepository {
  async listar(empresaId) {
    return prisma.fornecedor.findMany({
      where: {
        empresaId,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.fornecedor.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async criar(data) {
    return prisma.fornecedor.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.fornecedor.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.fornecedor.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new FornecedorRepository();
