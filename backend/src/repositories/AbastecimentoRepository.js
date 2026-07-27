const prisma = require("../config/prisma");

class AbastecimentoRepository {
  async listar(veiculoId, empresaId) {
    return prisma.abastecimento.findMany({
      where: { veiculoId, empresaId },
      orderBy: { createdAt: "desc" },
    });
  }

  async buscarMaisRecente(veiculoId, empresaId) {
    return prisma.abastecimento.findFirst({
      where: { veiculoId, empresaId },
      orderBy: { createdAt: "desc" },
    });
  }

  async criar(data) {
    return prisma.abastecimento.create({ data });
  }
}

module.exports = new AbastecimentoRepository();
