const prisma = require("../config/prisma");

class ContaBancariaRepository {
  async listar(empresaId) {
    return prisma.contaBancaria.findMany({
      where: {
        empresaId,
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.contaBancaria.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async criar(data) {
    return prisma.contaBancaria.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.contaBancaria.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id) {
    return prisma.contaBancaria.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }

  async somarTitulosPagos(contaBancariaId, tipo) {
    const resultado = await prisma.titulo.aggregate({
      where: {
        contaBancariaId,
        tipo,
        status: "paga",
      },
      _sum: {
        valor: true,
      },
    });

    return Number(resultado._sum.valor || 0);
  }
}

module.exports = new ContaBancariaRepository();
