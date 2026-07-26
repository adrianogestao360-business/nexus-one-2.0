const prisma = require("../config/prisma");

const VendaRepository = require("../repositories/VendaRepository");
const ClienteRepository = require("../repositories/ClienteRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");
const { calcularParcelas } = require("../utils/parcelamento");

class VendaService {
  async listar(empresaId) {
    return VendaRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const venda = await VendaRepository.findById(id, empresaId);

    if (!venda) {
      throw this.#naoEncontrada();
    }

    return venda;
  }

  async criar(data, empresaId) {
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
      });
    }

    const venda = await prisma.$transaction(async (tx) => {
      const novaVenda = await tx.venda.create({
        data: {
          clienteId: Number(clienteId),
          empresaId,
          total,
          itens: {
            create: itensCriar,
          },
        },
      });

      for (const item of itensCriar) {
        const alocacoes = await EstoqueLocalizacaoHelper.debitarAutoSelecionando(
          tx,
          {
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            empresaId,
          },
        );

        for (const alocacao of alocacoes) {
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
              quantidade: alocacao.quantidade,
              motivo: `Venda #${novaVenda.id}`,
              origem: "venda",
              saldoApos: produtoAtual.estoque,
              vendaId: novaVenda.id,
              localizacaoId: alocacao.localizacaoId,
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

  #naoEncontrada() {
    const error = new Error("Venda não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new VendaService();
