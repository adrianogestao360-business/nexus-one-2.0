const prisma = require("../config/prisma");

class LocalizacaoRepository {
  async listar(empresaId) {
    return prisma.localizacao.findMany({
      where: {
        empresaId,
      },
      include: {
        zona: true,
      },
      orderBy: {
        codigo: "asc",
      },
    });
  }

  async criar(data) {
    return prisma.localizacao.create({
      data,
    });
  }

  async findById(id, empresaId) {
    return prisma.localizacao.findFirst({
      where: {
        id,
        empresaId,
      },
    });
  }

  async buscarOuCriarGeral(empresaId, tx = prisma) {
    const existente = await tx.localizacao.findUnique({
      where: {
        empresaId_codigo: {
          empresaId,
          codigo: "GERAL",
        },
      },
    });

    if (existente) {
      return existente;
    }

    return tx.localizacao.create({
      data: {
        codigo: "GERAL",
        empresaId,
      },
    });
  }
}

module.exports = new LocalizacaoRepository();
