const prisma = require("../config/prisma");

const ProdutoRepository = require("../repositories/ProdutoRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");

class ProdutoService {
  async listar(empresaId) {
    return ProdutoRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const produto = await ProdutoRepository.findById(id, empresaId);

    if (!produto) {
      throw this.#naoEncontrado();
    }

    return produto;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);
    const estoqueInicial = dados.estoque;

    const produto = await prisma.$transaction(async (tx) => {
      const novoProduto = await tx.produto.create({
        data: { ...dados, empresaId, estoque: 0 },
      });

      if (estoqueInicial > 0) {
        const geral = await LocalizacaoRepository.buscarOuCriarGeral(
          empresaId,
          tx,
        );

        await EstoqueLocalizacaoHelper.creditar(tx, {
          produtoId: novoProduto.id,
          localizacaoId: geral.id,
          quantidade: estoqueInicial,
          empresaId,
        });
      }

      return novoProduto;
    });

    return this.buscarPorId(produto.id, empresaId);
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return ProdutoRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return ProdutoRepository.desativar(id);
  }

  #sanitizar(data) {
    const {
      codigo,
      descricao,
      categoria,
      unidade,
      preco,
      estoque,
      estoqueMinimo,
      zonaId,
      endereco,
    } = data;

    if (!codigo || !descricao) {
      const error = new Error("Código e descrição são obrigatórios.");
      error.status = 400;
      throw error;
    }

    return {
      codigo,
      descricao,
      categoria: categoria || null,
      unidade: unidade || null,
      preco: preco !== undefined && preco !== "" ? Number(preco) : 0,
      estoque: estoque !== undefined && estoque !== "" ? Number(estoque) : 0,
      estoqueMinimo:
        estoqueMinimo !== undefined && estoqueMinimo !== ""
          ? Number(estoqueMinimo)
          : 5,
      zonaId: zonaId ? Number(zonaId) : null,
      endereco: endereco || null,
    };
  }

  #naoEncontrado() {
    const error = new Error("Produto não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new ProdutoService();
