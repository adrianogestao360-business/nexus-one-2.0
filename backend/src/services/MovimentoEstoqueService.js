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

  async transferir(data, empresaId) {
    const {
      produtoId,
      localizacaoOrigemId,
      localizacaoDestinoId,
      quantidade,
      motivo,
    } = data;

    const quantidadeNum = Number(quantidade);

    if (
      !produtoId ||
      !localizacaoOrigemId ||
      !localizacaoDestinoId ||
      !quantidadeNum ||
      quantidadeNum <= 0
    ) {
      const error = new Error(
        "Produto, localização de origem, localização de destino e quantidade maior que zero são obrigatórios.",
      );
      error.status = 400;
      throw error;
    }

    if (Number(localizacaoOrigemId) === Number(localizacaoDestinoId)) {
      const error = new Error(
        "A localização de origem precisa ser diferente da de destino.",
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

    const [origem, destino] = await Promise.all([
      LocalizacaoRepository.findById(Number(localizacaoOrigemId), empresaId),
      LocalizacaoRepository.findById(Number(localizacaoDestinoId), empresaId),
    ]);

    if (!origem || !destino) {
      const error = new Error("Localização não encontrada.");
      error.status = 404;
      throw error;
    }

    const motivoTexto = motivo || `Transferência de ${origem.codigo} para ${destino.codigo}`;

    const [movimentoSaida, movimentoEntrada] = await prisma.$transaction(
      async (tx) => {
        const produtoAposSaida = await EstoqueLocalizacaoHelper.debitarDeLocalizacao(
          tx,
          {
            produtoId: produto.id,
            localizacaoId: origem.id,
            quantidade: quantidadeNum,
          },
        );

        const saida = await tx.movimentoEstoque.create({
          data: {
            produtoId: produto.id,
            empresaId,
            tipo: "saida",
            quantidade: quantidadeNum,
            motivo: motivoTexto,
            origem: "transferencia",
            saldoApos: produtoAposSaida.estoque,
            localizacaoId: origem.id,
          },
        });

        const produtoAposEntrada = await EstoqueLocalizacaoHelper.creditar(
          tx,
          {
            produtoId: produto.id,
            localizacaoId: destino.id,
            quantidade: quantidadeNum,
            empresaId,
          },
        );

        const entrada = await tx.movimentoEstoque.create({
          data: {
            produtoId: produto.id,
            empresaId,
            tipo: "entrada",
            quantidade: quantidadeNum,
            motivo: motivoTexto,
            origem: "transferencia",
            saldoApos: produtoAposEntrada.estoque,
            localizacaoId: destino.id,
          },
        });

        return [saida, entrada];
      },
    );

    return { movimentoSaida, movimentoEntrada };
  }
}

module.exports = new MovimentoEstoqueService();
