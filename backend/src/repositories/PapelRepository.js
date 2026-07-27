const prisma = require("../config/prisma");

class PapelRepository {
  async findAll(empresaId) {
    return prisma.papel.findMany({
      where: {
        empresaId,
      },
      include: {
        papelPermissoes: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async findById(id, empresaId) {
    return prisma.papel.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        papelPermissoes: {
          include: {
            permissao: true,
          },
        },
      },
    });
  }

  async criar(data) {
    return prisma.papel.create({
      data,
    });
  }

  async atualizar(id, data) {
    return prisma.papel.update({
      where: {
        id,
      },
      data,
    });
  }

  async contarUsuariosVinculados(id) {
    return prisma.usuarioPapel.count({
      where: {
        papelId: id,
      },
    });
  }

  async excluir(id) {
    return prisma.papel.delete({
      where: {
        id,
      },
    });
  }

  async sincronizarPermissoes(id, permissaoIds) {
    await prisma.$transaction([
      prisma.papelPermissao.deleteMany({
        where: {
          papelId: id,
        },
      }),
      prisma.papelPermissao.createMany({
        data: permissaoIds.map((permissaoId) => ({
          papelId: id,
          permissaoId,
        })),
      }),
    ]);
  }
}

module.exports = new PapelRepository();
