const prisma = require("../config/prisma");

class PermissaoRepository {
  async listar() {
    return prisma.permissao.findMany({
      orderBy: {
        codigo: "asc",
      },
    });
  }
}

module.exports = new PermissaoRepository();
