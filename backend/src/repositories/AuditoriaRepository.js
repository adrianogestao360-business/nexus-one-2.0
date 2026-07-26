const prisma = require("../config/prisma");

class AuditoriaRepository {
  async listar(empresaId, filtros = {}) {
    const { acao, entidade, usuarioId, dataInicio, dataFim } = filtros;

    return prisma.logAuditoria.findMany({
      where: {
        empresaId,
        acao: acao || undefined,
        entidade: entidade || undefined,
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
        createdAt:
          dataInicio || dataFim
            ? {
                gte: dataInicio ? new Date(`${dataInicio}T00:00:00`) : undefined,
                lte: dataFim ? new Date(`${dataFim}T23:59:59`) : undefined,
              }
            : undefined,
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });
  }

  async criar(data) {
    return prisma.logAuditoria.create({ data });
  }
}

module.exports = new AuditoriaRepository();
