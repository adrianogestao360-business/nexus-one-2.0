const prisma = require("../config/prisma");

class PosicaoMotoristaRepository {
  async criar(data) {
    return prisma.posicaoMotorista.create({ data });
  }

  async listarPorRota(rotaId) {
    return prisma.posicaoMotorista.findMany({
      where: { rotaId },
      orderBy: { registradoEm: "asc" },
    });
  }
}

module.exports = new PosicaoMotoristaRepository();
