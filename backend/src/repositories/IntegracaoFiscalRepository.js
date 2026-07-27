const prisma = require("../config/prisma");

class IntegracaoFiscalRepository {
  async findByEmpresaId(empresaId) {
    return prisma.integracaoFiscal.findUnique({
      where: {
        empresaId,
      },
    });
  }

  async upsert(empresaId, data) {
    return prisma.integracaoFiscal.upsert({
      where: {
        empresaId,
      },
      update: data,
      create: {
        empresaId,
        ...data,
      },
    });
  }
}

module.exports = new IntegracaoFiscalRepository();
