const prisma = require("../config/prisma");

const VendaRepository = require("../repositories/VendaRepository");
const ClienteRepository = require("../repositories/ClienteRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");
const LoteRepository = require("../repositories/LoteRepository");
const LoteService = require("./LoteService");
const { calcularParcelas } = require("../utils/parcelamento");

class VendaService {
  async listar(empresaId, filtros) {
    return VendaRepository.listar(empresaId, filtros);
  }

  async buscarPorId(id, empresaId) {
    const venda = await VendaRepository.findById(id, empresaId);

    if (!venda) {
      throw this.#naoEncontrada();
    }

    return venda;
  }

  async criar(data, empresaId, vendedorId) {
    const { clienteId, itens, parcelas } = data;

    if (!clienteId || !Array.isArray(itens) || itens.length === 0) {
      const error = new Error(
        "Cliente e ao menos um item são obrigatórios.",
      );
      error.status = 400;
      throw error;
    }

    const numeroParcelas =
      parcelas !== undefined && parcelas !== null && parcelas !== ""
        ? Number(parcelas)
        : 1;

    if (
      !Number.isInteger(numeroParcelas) ||
      numeroParcelas < 1 ||
      numeroParcelas > 36
    ) {
      const error = new Error("Número de parcelas inválido (1 a 36).");
      error.status = 400;
      throw error;
    }

    const cliente = await ClienteRepository.findById(
      Number(clienteId),
      empresaId,
    );

    if (!cliente) {
      const error = new Error("Cliente não encontrado.");
      error.status = 404;
      throw error;
    }

    let total = 0;
    const itensCriar = [];

    for (const item of itens) {
      const quantidade = Number(item.quantidade);

      if (!item.produtoId || !quantidade || quantidade <= 0) {
        const error = new Error(
          "Cada item precisa de um produto e uma quantidade maior que zero.",
        );
        error.status = 400;
        throw error;
      }

      const produto = await ProdutoRepository.findById(
        Number(item.produtoId),
        empresaId,
      );

      if (!produto) {
        const error = new Error("Produto não encontrado.");
        error.status = 404;
        throw error;
      }

      if (produto.estoque < quantidade) {
        const error = new Error(
          `Estoque insuficiente para o produto "${produto.descricao}".`,
        );
        error.status = 400;
        throw error;
      }

      const precoUnitario = Number(produto.preco);
      const subtotal = precoUnitario * quantidade;

      total += subtotal;

      itensCriar.push({
        produtoId: produto.id,
        quantidade,
        precoUnitario,
        subtotal,
        controlaLote: produto.controlaLote,
      });
    }

    const venda = await prisma.$transaction(async (tx) => {
      const novaVenda = await tx.venda.create({
        data: {
          clienteId: Number(clienteId),
          empresaId,
          vendedorId: vendedorId || null,
          total,
          itens: {
            create: itensCriar.map(
              ({ controlaLote, ...itemParaCriar }) => itemParaCriar,
            ),
          },
        },
      });

      for (const item of itensCriar) {
        const alocacoesLocalizacao =
          await EstoqueLocalizacaoHelper.debitarAutoSelecionando(tx, {
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            empresaId,
          });

        const alocacoesLote = item.controlaLote
          ? await LoteService.resolverConsumoAutomatico(tx, {
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              empresaId,
            })
          : null;

        const chunks = alocacoesLote
          ? this.#mesclarAlocacoes(alocacoesLocalizacao, alocacoesLote)
          : alocacoesLocalizacao.map((alocacao) => ({
              ...alocacao,
              loteId: null,
            }));

        for (const chunk of chunks) {
          const produtoAtual = await tx.produto.findUnique({
            where: {
              id: item.produtoId,
            },
          });

          await tx.movimentoEstoque.create({
            data: {
              produtoId: item.produtoId,
              empresaId,
              tipo: "saida",
              quantidade: chunk.quantidade,
              motivo: `Venda #${novaVenda.id}`,
              origem: "venda",
              saldoApos: produtoAtual.estoque,
              vendaId: novaVenda.id,
              localizacaoId: chunk.localizacaoId,
              loteId: chunk.loteId,
            },
          });
        }
      }

      if (numeroParcelas === 1) {
        await tx.titulo.create({
          data: {
            tipo: "receber",
            descricao: `Venda #${novaVenda.id}`,
            valor: total,
            vencimento: new Date(),
            empresaId,
            clienteId: Number(clienteId),
            vendaId: novaVenda.id,
          },
        });
      } else {
        for (const parcela of calcularParcelas(total, numeroParcelas)) {
          await tx.titulo.create({
            data: {
              tipo: "receber",
              descricao: `Venda #${novaVenda.id} - Parcela ${parcela.numero}/${numeroParcelas}`,
              valor: parcela.valor,
              vencimento: parcela.vencimento,
              parcela: parcela.numero,
              totalParcelas: numeroParcelas,
              empresaId,
              clienteId: Number(clienteId),
              vendaId: novaVenda.id,
            },
          });
        }
      }

      await tx.separacao.create({
        data: {
          vendaId: novaVenda.id,
          empresaId,
          itens: {
            create: itensCriar.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
            })),
          },
        },
      });

      await tx.notaFiscal.create({
        data: {
          tipo: "saida",
          empresaId,
          vendaId: novaVenda.id,
        },
      });

      return novaVenda;
    });

    return this.buscarPorId(venda.id, empresaId);
  }

  async cancelar(id, empresaId) {
    const venda = await this.buscarPorId(id, empresaId);

    if (venda.status === "cancelada") {
      const error = new Error("Venda já está cancelada.");
      error.status = 400;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      await tx.venda.update({
        where: {
          id,
        },
        data: {
          status: "cancelada",
        },
      });

      const movimentosSaida = venda.movimentos.filter(
        (movimento) => movimento.tipo === "saida",
      );

      for (const movimento of movimentosSaida) {
        const localizacaoId =
          movimento.localizacaoId ||
          (await LocalizacaoRepository.buscarOuCriarGeral(empresaId, tx)).id;

        const produtoAtualizado = await EstoqueLocalizacaoHelper.creditar(
          tx,
          {
            produtoId: movimento.produtoId,
            localizacaoId,
            quantidade: movimento.quantidade,
            empresaId,
          },
        );

        if (movimento.loteId) {
          await LoteRepository.incrementar(
            movimento.loteId,
            movimento.quantidade,
            tx,
          );
        }

        await tx.movimentoEstoque.create({
          data: {
            produtoId: movimento.produtoId,
            empresaId,
            tipo: "entrada",
            quantidade: movimento.quantidade,
            motivo: `Cancelamento da Venda #${id}`,
            origem: "venda",
            saldoApos: produtoAtualizado.estoque,
            vendaId: id,
            localizacaoId,
            loteId: movimento.loteId || null,
          },
        });
      }

      await tx.titulo.updateMany({
        where: {
          vendaId: id,
          status: "aberta",
        },
        data: {
          status: "cancelada",
        },
      });

      await tx.separacao.updateMany({
        where: {
          vendaId: id,
        },
        data: {
          status: "cancelada",
        },
      });

      await tx.notaFiscal.updateMany({
        where: {
          vendaId: id,
        },
        data: {
          status: "cancelada",
        },
      });
    });
  }

  #mesclarAlocacoes(alocacoesLocalizacao, alocacoesLote) {
    const chunks = [];

    let i = 0;
    let j = 0;
    let restanteLocalizacao = alocacoesLocalizacao[0]?.quantidade || 0;
    let restanteLote = alocacoesLote[0]?.quantidade || 0;

    while (i < alocacoesLocalizacao.length && j < alocacoesLote.length) {
      const consumir = Math.min(restanteLocalizacao, restanteLote);

      chunks.push({
        localizacaoId: alocacoesLocalizacao[i].localizacaoId,
        loteId: alocacoesLote[j].loteId,
        quantidade: consumir,
      });

      restanteLocalizacao -= consumir;
      restanteLote -= consumir;

      if (restanteLocalizacao === 0) {
        i += 1;
        restanteLocalizacao = alocacoesLocalizacao[i]?.quantidade || 0;
      }

      if (restanteLote === 0) {
        j += 1;
        restanteLote = alocacoesLote[j]?.quantidade || 0;
      }
    }

    return chunks;
  }

  #naoEncontrada() {
    const error = new Error("Venda não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new VendaService();
