const prisma = require("../config/prisma");

const ProdutoRepository = require("../repositories/ProdutoRepository");
const MovimentoEstoqueRepository = require("../repositories/MovimentoEstoqueRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");

class MovimentoEstoqueService {
  async listar(empresaId, produtoId) {
    return MovimentoEstoqueRepository.listar(
      empresaId,
      produtoId ? Number(produtoId) : undefined,
    );
  }

  async criar(data, empresaId) {
    const { produtoId, tipo, quantidade, motivo, localizacaoId } = data;

    if (tipo !== "entrada" && tipo !== "saida") {
      const error = new Error('Tipo deve ser "entrada" ou "saida".');
      error.status = 400;
      throw error;
    }

    const quantidadeNum = Number(quantidade);

    if (!produtoId || !quantidadeNum || quantidadeNum <= 0 || !motivo) {
      const error = new Error(
        "Produto, quantidade maior que zero e motivo são obrigatórios.",
      );
      error.status = 400;
      throw error;
    }

    const produto = await ProdutoRepository.findById(
      Number(produtoId),
      empresaId,
    );

    if (!produto) {
      const error = new Error("Produto não encontrado.");
      error.status = 404;
      throw error;
    }

    const movimento = await prisma.$transaction(async (tx) => {
      const localizacaoAlvo = localizacaoId
        ? Number(localizacaoId)
        : (await LocalizacaoRepository.buscarOuCriarGeral(empresaId, tx)).id;

      const produtoAtualizado =
        tipo === "entrada"
          ? await EstoqueLocalizacaoHelper.creditar(tx, {
              produtoId: produto.id,
              localizacaoId: localizacaoAlvo,
              quantidade: quantidadeNum,
              empresaId,
            })
          : await EstoqueLocalizacaoHelper.debitarDeLocalizacao(tx, {
              produtoId: produto.id,
              localizacaoId: localizacaoAlvo,
              quantidade: quantidadeNum,
            });

      return tx.movimentoEstoque.create({
        data: {
          produtoId: produto.id,
          empresaId,
          tipo,
          quantidade: quantidadeNum,
          motivo,
          origem: "manual",
          saldoApos: produtoAtualizado.estoque,
          localizacaoId: localizacaoAlvo,
        },
      });
    });

    return movimento;
  }
}

module.exports = new MovimentoEstoqueService();
