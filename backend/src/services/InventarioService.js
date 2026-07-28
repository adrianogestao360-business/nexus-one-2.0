const prisma = require("../config/prisma");

const InventarioRepository = require("../repositories/InventarioRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");

class InventarioService {
  async listar(empresaId) {
    return InventarioRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const inventario = await InventarioRepository.findById(id, empresaId);

    if (!inventario) {
      throw this.#naoEncontrado();
    }

    return inventario;
  }

  async abrir(data, empresaId, usuarioId) {
    const { tipo, localizacaoId, produtoId, observacao } = data;

    if (localizacaoId) {
      const localizacao = await LocalizacaoRepository.findById(
        Number(localizacaoId),
        empresaId,
      );

      if (!localizacao) {
        const error = new Error("Localização não encontrada.");
        error.status = 404;
        throw error;
      }
    }

    if (produtoId) {
      const produto = await ProdutoRepository.findById(
        Number(produtoId),
        empresaId,
      );

      if (!produto) {
        const error = new Error("Produto não encontrado.");
        error.status = 404;
        throw error;
      }
    }

    const saldos = await InventarioRepository.listarEstoqueParaSnapshot(
      empresaId,
      {
        localizacaoId: localizacaoId ? Number(localizacaoId) : undefined,
        produtoId: produtoId ? Number(produtoId) : undefined,
      },
    );

    if (saldos.length === 0) {
      const error = new Error(
        "Nenhum saldo de estoque encontrado para os filtros informados.",
      );
      error.status = 400;
      throw error;
    }

    const itens = saldos.map((saldo) => ({
      produtoId: saldo.produtoId,
      localizacaoId: saldo.localizacaoId,
      quantidadeSistema: saldo.quantidade,
    }));

    return InventarioRepository.criar(
      {
        tipo: tipo === "rotativo" ? "rotativo" : "geral",
        status: "aberto",
        empresaId,
        localizacaoId: localizacaoId ? Number(localizacaoId) : null,
        produtoId: produtoId ? Number(produtoId) : null,
        observacao: observacao || null,
        criadoPorId: usuarioId || null,
      },
      itens,
    );
  }

  async registrarContagem(inventarioId, itemId, quantidadeContada, empresaId) {
    const inventario = await this.buscarPorId(inventarioId, empresaId);

    if (inventario.status !== "aberto") {
      const error = new Error(
        "Só é possível registrar contagem em um inventário aberto.",
      );
      error.status = 400;
      throw error;
    }

    const quantidadeNum = Number(quantidadeContada);

    if (quantidadeContada === undefined || quantidadeNum < 0 || Number.isNaN(quantidadeNum)) {
      const error = new Error("Quantidade contada deve ser um número maior ou igual a zero.");
      error.status = 400;
      throw error;
    }

    const item = await InventarioRepository.findItemById(
      Number(itemId),
      inventario.id,
    );

    if (!item) {
      const error = new Error("Item de inventário não encontrado.");
      error.status = 404;
      throw error;
    }

    return InventarioRepository.atualizarContagem(item.id, quantidadeNum);
  }

  async fechar(inventarioId, empresaId) {
    const inventario = await this.buscarPorId(inventarioId, empresaId);

    if (inventario.status !== "aberto") {
      const error = new Error("Este inventário já está fechado.");
      error.status = 400;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      for (const item of inventario.itens) {
        if (item.quantidadeContada === null) {
          continue;
        }

        const estoqueAtual = await tx.estoqueLocalizacao.findUnique({
          where: {
            produtoId_localizacaoId: {
              produtoId: item.produtoId,
              localizacaoId: item.localizacaoId,
            },
          },
        });

        const saldoAtual = estoqueAtual?.quantidade || 0;
        const diferenca = item.quantidadeContada - saldoAtual;

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
            motivo: `Ajuste de inventário #${inventario.id}`,
            origem: "ajuste_inventario",
            saldoApos: produtoAtualizado.estoque,
            localizacaoId: item.localizacaoId,
          },
        });
      }

      await InventarioRepository.atualizarStatus(inventario.id, "fechado", tx);
    });

    return this.buscarPorId(inventarioId, empresaId);
  }

  #naoEncontrado() {
    const error = new Error("Inventário não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new InventarioService();
