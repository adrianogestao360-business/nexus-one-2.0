const prisma = require("../config/prisma");

class FolhaPagamentoRepository {
  async listar(empresaId) {
    return prisma.folhaPagamento.findMany({
      where: {
        empresaId,
      },
      include: {
        itens: true,
      },
      orderBy: [{ ano: "desc" }, { mes: "desc" }],
    });
  }

  async findById(id, empresaId) {
    return prisma.folhaPagamento.findFirst({
      where: {
        id,
        empresaId,
      },
      include: {
        itens: {
          include: {
            funcionario: {
              include: {
                cargo: true,
              },
            },
          },
        },
      },
    });
  }

  async findByMesAno(mes, ano, empresaId) {
    return prisma.folhaPagamento.findFirst({
      where: {
        mes,
        ano,
        empresaId,
      },
    });
  }

  async criarComItens({ mes, ano, empresaId }, funcionarios) {
    return prisma.$transaction(async (tx) => {
      const folha = await tx.folhaPagamento.create({
        data: {
          mes,
          ano,
          empresaId,
        },
      });

      for (const funcionario of funcionarios) {
        await tx.folhaPagamentoItem.create({
          data: {
            folhaId: folha.id,
            funcionarioId: funcionario.id,
            proventos: funcionario.salarioBase,
            descontos: 0,
            valorLiquido: funcionario.salarioBase,
          },
        });
      }

      return tx.folhaPagamento.findUnique({
        where: {
          id: folha.id,
        },
        include: {
          itens: {
            include: {
              funcionario: true,
            },
          },
        },
      });
    });
  }

  async fecharComTitulos({ folhaId, empresaId, itensParaTitulo }) {
    return prisma.$transaction(async (tx) => {
      for (const item of itensParaTitulo) {
        await tx.titulo.create({
          data: {
            tipo: "pagar",
            descricao: item.descricao,
            valor: item.valor,
            vencimento: item.vencimento,
            empresaId,
            folhaPagamentoItemId: item.id,
          },
        });
      }

      return tx.folhaPagamento.update({
        where: {
          id: folhaId,
        },
        data: {
          status: "fechada",
          fechadaEm: new Date(),
        },
      });
    });
  }

  async findItemById(itemId, empresaId) {
    return prisma.folhaPagamentoItem.findFirst({
      where: {
        id: itemId,
        folha: {
          empresaId,
        },
      },
      include: {
        folha: true,
      },
    });
  }

  async atualizarItem(itemId, data) {
    return prisma.folhaPagamentoItem.update({
      where: {
        id: itemId,
      },
      data,
    });
  }
}

module.exports = new FolhaPagamentoRepository();
