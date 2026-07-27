const prisma = require("../config/prisma");

const DevolucaoRepository = require("../repositories/DevolucaoRepository");
const VendaRepository = require("../repositories/VendaRepository");
const CompraRepository = require("../repositories/CompraRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");

class DevolucaoService {
  async listar(empresaId) {
    return DevolucaoRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const devolucao = await DevolucaoRepository.findById(id, empresaId);

    if (!devolucao) {
      throw this.#naoEncontrada();
    }

    return devolucao;
  }

  async criarDevolucaoVenda(vendaId, data, empresaId) {
    const venda = await VendaRepository.findById(vendaId, empresaId);

    if (!venda) {
      const error = new Error("Venda não encontrada.");
      error.status = 404;
      throw error;
    }

    if (venda.status !== "confirmada") {
      const error = new Error(
        "Só é possível registrar devolução de uma venda confirmada.",
      );
      error.status = 400;
      throw error;
    }

    const itensValidados = await this.#validarItens(
      data,
      venda.itens,
      "vendaId",
      vendaId,
    );

    const valorTotal = itensValidados.reduce(
      (soma, item) => soma + item.subtotal,
      0,
    );

    const devolucao = await prisma.$transaction(async (tx) => {
      const novaDevolucao = await tx.devolucao.create({
        data: {
          tipo: "venda",
          motivo: data.motivo,
          empresaId,
          vendaId,
          valorTotal,
          itens: {
            create: itensValidados,
          },
        },
      });

      const geral = await LocalizacaoRepository.buscarOuCriarGeral(
        empresaId,
        tx,
      );

      for (const item of itensValidados) {
        await EstoqueLocalizacaoHelper.creditar(tx, {
          produtoId: item.produtoId,
          localizacaoId: geral.id,
          quantidade: item.quantidade,
          empresaId,
        });

        const produtoAtual = await tx.produto.findUnique({
          where: { id: item.produtoId },
        });

        await tx.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            empresaId,
            tipo: "entrada",
            quantidade: item.quantidade,
            motivo: `Devolução Venda #${vendaId}`,
            origem: "devolucao",
            saldoApos: produtoAtual.estoque,
            vendaId,
            localizacaoId: geral.id,
          },
        });
      }

      await tx.titulo.create({
        data: {
          tipo: "pagar",
          descricao: `Devolução Venda #${vendaId}`,
          valor: valorTotal,
          vencimento: new Date(),
          empresaId,
          vendaId,
        },
      });

      return novaDevolucao;
    });

    return this.buscarPorId(devolucao.id, empresaId);
  }

  async criarDevolucaoCompra(compraId, data, empresaId) {
    const compra = await CompraRepository.findById(compraId, empresaId);

    if (!compra) {
      const error = new Error("Compra não encontrada.");
      error.status = 404;
      throw error;
    }

    if (compra.status !== "confirmada") {
      const error = new Error(
        "Só é possível registrar devolução de uma compra confirmada.",
      );
      error.status = 400;
      throw error;
    }

    const itensValidados = await this.#validarItens(
      data,
      compra.itens,
      "compraId",
      compraId,
    );

    const valorTotal = itensValidados.reduce(
      (soma, item) => soma + item.subtotal,
      0,
    );

    const devolucao = await prisma.$transaction(async (tx) => {
      const novaDevolucao = await tx.devolucao.create({
        data: {
          tipo: "compra",
          motivo: data.motivo,
          empresaId,
          compraId,
          valorTotal,
          itens: {
            create: itensValidados,
          },
        },
      });

      for (const item of itensValidados) {
        const alocacoes = await EstoqueLocalizacaoHelper.debitarAutoSelecionando(
          tx,
          {
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            empresaId,
          },
        );

        const produtoAtual = await tx.produto.findUnique({
          where: { id: item.produtoId },
        });

        for (const alocacao of alocacoes) {
          await tx.movimentoEstoque.create({
            data: {
              produtoId: item.produtoId,
              empresaId,
              tipo: "saida",
              quantidade: alocacao.quantidade,
              motivo: `Devolução Compra #${compraId}`,
              origem: "devolucao",
              saldoApos: produtoAtual.estoque,
              compraId,
              localizacaoId: alocacao.localizacaoId,
            },
          });
        }
      }

      await tx.titulo.create({
        data: {
          tipo: "receber",
          descricao: `Devolução Compra #${compraId}`,
          valor: valorTotal,
          vencimento: new Date(),
          empresaId,
          compraId,
        },
      });

      return novaDevolucao;
    });

    return this.buscarPorId(devolucao.id, empresaId);
  }

  async #validarItens(data, itensOriginais, campoReferencia, referenciaId) {
    const { itens } = data;

    if (!data.motivo || !data.motivo.trim()) {
      const error = new Error("Motivo da devolução é obrigatório.");
      error.status = 400;
      throw error;
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      const error = new Error(
        "Informe ao menos um item para a devolução.",
      );
      error.status = 400;
      throw error;
    }

    const itensValidados = [];

    for (const item of itens) {
      const quantidade = Number(item.quantidade);
      const produtoId = Number(item.produtoId);

      if (!produtoId || !quantidade || quantidade <= 0) {
        const error = new Error(
          "Cada item precisa de um produto e uma quantidade maior que zero.",
        );
        error.status = 400;
        throw error;
      }

      const itemOriginal = itensOriginais.find(
        (original) => original.produtoId === produtoId,
      );

      if (!itemOriginal) {
        const error = new Error(
          `Produto ${produtoId} não faz parte deste pedido.`,
        );
        error.status = 400;
        throw error;
      }

      const jaDevolvido = await DevolucaoRepository.somarQuantidadeDevolvida(
        campoReferencia,
        referenciaId,
        produtoId,
      );

      const disponivel = itemOriginal.quantidade - jaDevolvido;

      if (quantidade > disponivel) {
        const error = new Error(
          `Quantidade a devolver do produto "${itemOriginal.produto.descricao}" excede o disponível (${disponivel}).`,
        );
        error.status = 400;
        throw error;
      }

      const valorUnitario = Number(itemOriginal.precoUnitario);

      itensValidados.push({
        produtoId,
        quantidade,
        valorUnitario,
        subtotal: valorUnitario * quantidade,
      });
    }

    return itensValidados;
  }

  #naoEncontrada() {
    const error = new Error("Devolução não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new DevolucaoService();
