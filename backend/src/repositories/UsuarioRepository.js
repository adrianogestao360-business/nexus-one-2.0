const prisma = require("../config/prisma");

class UsuarioRepository {
  async listar(empresaId) {
    return prisma.usuario.findMany({
      where: {
        empresaId,
      },
      include: {
        empresa: true,
        usuarioPapeis: {
          include: {
            papel: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  async buscarPorEmail(email) {
    return prisma.usuario.findUnique({
      where: {
        email,
      },
      include: this.#includeComPermissoes(),
    });
  }

  async buscarPorId(id) {
    return prisma.usuario.findUnique({
      where: {
        id,
      },
      include: this.#includeComPermissoes(),
    });
  }

  #includeComPermissoes() {
    return {
      usuarioPapeis: {
        include: {
          papel: {
            include: {
              papelPermissoes: {
                include: {
                  permissao: true,
                },
              },
            },
          },
        },
      },
    };
  }

  async findById(id, empresaId) {
    return prisma.usuario.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        empresa: true,
        usuarioPapeis: {
          include: {
            papel: true,
          },
        },
      },
    });
  }

  async criar(data) {
    const { papelId, ...usuario } = data;

    return prisma.usuario.create({
      data: {
        ...usuario,
        usuarioPapeis: papelId
          ? {
              create: {
                papelId,
              },
            }
          : undefined,
      },
    });
  }

  async atualizar(id, data) {
    const { papelId, ...usuario } = data;

    return prisma.usuario.update({
      where: {
        id,
      },
      data: {
        ...usuario,
        usuarioPapeis: papelId
          ? {
              deleteMany: {},
              create: {
                papelId,
              },
            }
          : undefined,
      },
    });
  }

  async desativar(id) {
    return prisma.usuario.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

module.exports = new UsuarioRepository();