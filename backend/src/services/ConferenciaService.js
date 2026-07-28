const prisma = require("../config/prisma");

const ConferenciaRepository = require("../repositories/ConferenciaRepository");
const CompraRepository = require("../repositories/CompraRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");

class ConferenciaService {
  async listar(empresaId) {
    return ConferenciaRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const conferencia = await ConferenciaRepository.findById(id, empresaId);

    if (!conferencia) {
      throw this.#naoEncontrada();
    }

    return conferencia;
  }

  async abrir(compraId, data, empresaId) {
    const compra = await CompraRepository.findById(
      Number(compraId),
      empresaId,
    );

    if (!compra) {
      const error = new Error("Compra não encontrada.");
      error.status = 404;
      throw error;
    }

    if (compra.status === "cancelada") {
      const error = new Error(
        "Não é possível conferir uma compra cancelada.",
      );
      error.status = 400;
      throw error;
    }

    const conferenciaAberta = await ConferenciaRepository.findAbertaPorCompra(
      compra.id,
      empresaId,
    );

    if (conferenciaAberta) {
      const error = new Error(
        "Já existe uma conferência em aberto para esta compra.",
      );
      error.status = 400;
      throw error;
    }

    const localizacaoGeral = await LocalizacaoRepository.buscarOuCriarGeral(
      empresaId,
    );

    const itens = compra.itens.map((item) => {
      const movimentoEntrada = compra.movimentos.find(
        (movimento) =>
          movimento.tipo === "entrada" && movimento.produtoId === item.produtoId,
      );

      return {
        produtoId: item.produtoId,
        localizacaoId: movimentoEntrada?.localizacaoId || localizacaoGeral.id,
        quantidadePedida: item.quantidade,
      };
    });

    return ConferenciaRepository.criar(
      {
        compraId: compra.id,
        empresaId,
        status: "aberta",
        observacao: data?.observacao || null,
      },
      itens,
    );
  }

  async registrarRecebimento(conferenciaId, itemId, quantidadeRecebida, empresaId) {
    const conferencia = await this.buscarPorId(conferenciaId, empresaId);

    if (conferencia.status !== "aberta") {
      const error = new Error(
        "Só é possível registrar recebimento em uma conferência aberta.",
      );
      error.status = 400;
      throw error;
    }

    const quantidadeNum = Number(quantidadeRecebida);

    if (
      quantidadeRecebida === undefined ||
      Number.isNaN(quantidadeNum) ||
      quantidadeNum < 0
    ) {
      const error = new Error(
        "Quantidade recebida deve ser um número maior ou igual a zero.",
      );
      error.status = 400;
      throw error;
    }

    const item = await ConferenciaRepository.findItemById(
      Number(itemId),
      conferencia.id,
    );

    if (!item) {
      const error = new Error("Item de conferência não encontrado.");
      error.status = 404;
      throw error;
    }

    return ConferenciaRepository.atualizarRecebimento(item.id, quantidadeNum);
  }

  async concluir(conferenciaId, empresaId) {
    const conferencia = await this.buscarPorId(conferenciaId, empresaId);

    if (conferencia.status !== "aberta") {
      const error = new Error("Esta conferência já está concluída.");
      error.status = 400;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      for (const item of conferencia.itens) {
        if (item.quantidadeRecebida === null) {
          continue;
        }

        const diferenca = item.quantidadeRecebida - item.quantidadePedida;

        if (diferenca === 0) {
          continue;
        }

        const tipo = diferenca > 0 ? "entrada" : "saida";
        const quantidadeMovimento = Math.abs(diferenca);

        const produtoAtualizado =
          tipo === "entrada"
            ? await EstoqueLocalizacaoHelper.creditar(tx, {
                produtoId: item.produtoId,
                localizacaoId: item.localizacaoId,
                quantidade: quantidadeMovimento,
                empresaId,
              })
            : await EstoqueLocalizacaoHelper.debitarDeLocalizacao(tx, {
                produtoId: item.produtoId,
                localizacaoId: item.localizacaoId,
                quantidade: quantidadeMovimento,
              });

        await tx.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            empresaId,
            tipo,
            quantidade: quantidadeMovimento,
            motivo: `Divergência na conferência de recebimento da Compra #${conferencia.compraId}`,
            origem: "conferencia_recebimento",
            saldoApos: produtoAtualizado.estoque,
            localizacaoId: item.localizacaoId,
            compraId: conferencia.compraId,
          },
        });
      }

      await ConferenciaRepository.atualizarStatus(
        conferencia.id,
        "concluida",
        tx,
      );
    });

    return this.buscarPorId(conferenciaId, empresaId);
  }

  #naoEncontrada() {
    const error = new Error("Conferência não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new ConferenciaService();
