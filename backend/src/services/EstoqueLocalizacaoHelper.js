class EstoqueLocalizacaoHelper {
  async creditar(tx, { produtoId, localizacaoId, quantidade, empresaId }) {
    await tx.estoqueLocalizacao.upsert({
      where: {
        produtoId_localizacaoId: {
          produtoId,
          localizacaoId,
        },
      },
      update: {
        quantidade: {
          increment: quantidade,
        },
      },
      create: {
        produtoId,
        localizacaoId,
        empresaId,
        quantidade,
      },
    });

    return tx.produto.update({
      where: {
        id: produtoId,
      },
      data: {
        estoque: {
          increment: quantidade,
        },
      },
    });
  }

  async debitarDeLocalizacao(tx, { produtoId, localizacaoId, quantidade }) {
    const estoqueLocal = await tx.estoqueLocalizacao.findUnique({
      where: {
        produtoId_localizacaoId: {
          produtoId,
          localizacaoId,
        },
      },
    });

    if (!estoqueLocal || estoqueLocal.quantidade < quantidade) {
      const error = new Error("Estoque insuficiente nessa localização.");
      error.status = 400;
      throw error;
    }

    await tx.estoqueLocalizacao.update({
      where: {
        produtoId_localizacaoId: {
          produtoId,
          localizacaoId,
        },
      },
      data: {
        quantidade: {
          decrement: quantidade,
        },
      },
    });

    return tx.produto.update({
      where: {
        id: produtoId,
      },
      data: {
        estoque: {
          decrement: quantidade,
        },
      },
    });
  }

  async debitarPermissivo(tx, { produtoId, localizacaoId, quantidade, empresaId }) {
    await tx.estoqueLocalizacao.upsert({
      where: {
        produtoId_localizacaoId: {
          produtoId,
          localizacaoId,
        },
      },
      update: {
        quantidade: {
          decrement: quantidade,
        },
      },
      create: {
        produtoId,
        localizacaoId,
        empresaId,
        quantidade: -quantidade,
      },
    });

    return tx.produto.update({
      where: {
        id: produtoId,
      },
      data: {
        estoque: {
          decrement: quantidade,
        },
      },
    });
  }

  async debitarAutoSelecionando(tx, { produtoId, quantidade, empresaId }) {
    const saldos = await tx.estoqueLocalizacao.findMany({
      where: {
        produtoId,
        empresaId,
        quantidade: {
          gt: 0,
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    let restante = quantidade;
    const alocacoes = [];

    for (const saldo of saldos) {
      if (restante <= 0) {
        break;
      }

      const disponivel =
        saldo.quantidade - saldo.quantidadeBloqueada - saldo.quantidadeReservada;

      if (disponivel <= 0) {
        continue;
      }

      const consumir = Math.min(disponivel, restante);

      await tx.estoqueLocalizacao.update({
        where: {
          id: saldo.id,
        },
        data: {
          quantidade: {
            decrement: consumir,
          },
        },
      });

      alocacoes.push({
        localizacaoId: saldo.localizacaoId,
        quantidade: consumir,
      });

      restante -= consumir;
    }

    if (restante > 0) {
      const error = new Error(
        "Estoque disponível insuficiente (parte pode estar bloqueada ou reservada).",
      );
      error.status = 409;
      throw error;
    }

    await tx.produto.update({
      where: {
        id: produtoId,
      },
      data: {
        estoque: {
          decrement: quantidade,
        },
      },
    });

    return alocacoes;
  }
}

module.exports = new EstoqueLocalizacaoHelper();
