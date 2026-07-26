const prisma = require("../config/prisma");

const CompraRepository = require("../repositories/CompraRepository");
const FornecedorRepository = require("../repositories/FornecedorRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const LocalizacaoRepository = require("../repositories/LocalizacaoRepository");
const EstoqueLocalizacaoHelper = require("./EstoqueLocalizacaoHelper");
const { calcularParcelas } = require("../utils/parcelamento");

class CompraService {
  async listar(empresaId) {
    return CompraRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const compra = await CompraRepository.findById(id, empresaId);

    if (!compra) {
      throw this.#naoEncontrada();
    }

    return compra;
  }

  async criar(data, empresaId) {
    const { fornecedorId, itens, parcelas, localizacaoId } = data;

    if (!fornecedorId || !Array.isArray(itens) || itens.length === 0) {
      const error = new Error(
        "Fornecedor e ao menos um item são obrigatórios.",
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

    const fornecedor = await FornecedorRepository.findById(
      Number(fornecedorId),
      empresaId,
    );

    if (!fornecedor) {
      const error = new Error("Fornecedor não encontrado.");
      error.status = 404;
      throw error;
    }

    let total = 0;
    const itensCriar = [];

    for (const item of itens) {
      const quantidade = Number(item.quantidade);
      const precoUnitario = Number(item.precoUnitario);

      if (!item.produtoId || !quantidade || quantidade <= 0) {
        const error = new Error(
          "Cada item precisa de um produto e uma quantidade maior que zero.",
        );
        error.status = 400;
        throw error;
      }

      if (!precoUnitario || precoUnitario <= 0) {
        const error = new Error(
          "Cada item precisa de um preço unitário maior que zero.",
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

      const subtotal = precoUnitario * quantidade;

      total += subtotal;

      itensCriar.push({
        produtoId: produto.id,
        quantidade,
        precoUnitario,
        subtotal,
      });
    }

    const compra = await prisma.$transaction(async (tx) => {
      const novaCompra = await tx.compra.create({
        data: {
          fornecedorId: Number(fornecedorId),
          empresaId,
          total,
          itens: {
            create: itensCriar,
          },
        },
      });

      const localizacaoDestino = localizacaoId
        ? Number(localizacaoId)
        : (await LocalizacaoRepository.buscarOuCriarGeral(empresaId, tx)).id;

      for (const item of itensCriar) {
        const produtoAtualizado = await EstoqueLocalizacaoHelper.creditar(
          tx,
          {
            produtoId: item.produtoId,
            localizacaoId: localizacaoDestino,
            quantidade: item.quantidade,
            empresaId,
          },
        );

        await tx.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            empresaId,
            tipo: "entrada",
            quantidade: item.quantidade,
            motivo: `Compra #${novaCompra.id}`,
            origem: "compra",
            saldoApos: produtoAtualizado.estoque,
            compraId: novaCompra.id,
            localizacaoId: localizacaoDestino,
          },
        });
      }

      if (numeroParcelas === 1) {
        await tx.titulo.create({
          data: {
            tipo: "pagar",
            descricao: `Compra #${novaCompra.id}`,
            valor: total,
            vencimento: new Date(),
            empresaId,
            fornecedorId: Number(fornecedorId),
            compraId: novaCompra.id,
          },
        });
      } else {
        for (const parcela of calcularParcelas(total, numeroParcelas)) {
          await tx.titulo.create({
            data: {
              tipo: "pagar",
              descricao: `Compra #${novaCompra.id} - Parcela ${parcela.numero}/${numeroParcelas}`,
              valor: parcela.valor,
              vencimento: parcela.vencimento,
              parcela: parcela.numero,
              totalParcelas: numeroParcelas,
              empresaId,
              fornecedorId: Number(fornecedorId),
              compraId: novaCompra.id,
            },
          });
        }
      }

      await tx.notaFiscal.create({
        data: {
          tipo: "entrada",
          empresaId,
          compraId: novaCompra.id,
        },
      });

      return novaCompra;
    });

    return this.buscarPorId(compra.id, empresaId);
  }

  async cancelar(id, empresaId) {
    const compra = await this.buscarPorId(id, empresaId);

    if (compra.status === "cancelada") {
      const error = new Error("Compra já está cancelada.");
      error.status = 400;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      await tx.compra.update({
        where: {
          id,
        },
        data: {
          status: "cancelada",
        },
      });

      const movimentosEntrada = compra.movimentos.filter(
        (movimento) => movimento.tipo === "entrada",
      );

      for (const movimento of movimentosEntrada) {
        const localizacaoId =
          movimento.localizacaoId ||
          (await LocalizacaoRepository.buscarOuCriarGeral(empresaId, tx)).id;

        const produtoAtualizado = await EstoqueLocalizacaoHelper.debitarPermissivo(
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
            tipo: "saida",
            quantidade: movimento.quantidade,
            motivo: `Cancelamento da Compra #${id}`,
            origem: "compra",
            saldoApos: produtoAtualizado.estoque,
            compraId: id,
            localizacaoId,
          },
        });
      }

      await tx.titulo.updateMany({
        where: {
          compraId: id,
          status: "aberta",
        },
        data: {
          status: "cancelada",
        },
      });

      await tx.notaFiscal.updateMany({
        where: {
          compraId: id,
        },
        data: {
          status: "cancelada",
        },
      });
    });
  }

  #naoEncontrada() {
    const error = new Error("Compra não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new CompraService();
