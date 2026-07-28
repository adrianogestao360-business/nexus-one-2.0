const prisma = require("../config/prisma");
const ContaBancariaService = require("./ContaBancariaService");

class FluxoCaixaService {
  async obter(empresaId, filtros = {}) {
    const contas = await ContaBancariaService.listar(empresaId);
    const saldoAtualTotal = contas.reduce(
      (soma, conta) => soma + conta.saldoAtual,
      0,
    );

    const projecao = await this.#calcularProjecao(
      empresaId,
      saldoAtualTotal,
      filtros,
    );

    return { saldoAtualTotal, contas, projecao };
  }

  async #calcularProjecao(empresaId, saldoInicial, filtros) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataInicio = filtros.dataInicio
      ? new Date(`${filtros.dataInicio}T00:00:00`)
      : hoje;

    let dataFim;
    if (filtros.dataFim) {
      dataFim = new Date(`${filtros.dataFim}T00:00:00`);
    } else {
      dataFim = new Date(dataInicio);
      dataFim.setDate(dataFim.getDate() + 30);
    }

    const titulosAbertos = await prisma.titulo.findMany({
      where: {
        empresaId,
        status: "aberta",
        vencimento: { gte: dataInicio, lte: dataFim },
      },
      select: { tipo: true, valor: true, vencimento: true },
    });

    const dias = [];
    const cursor = new Date(dataInicio);

    while (cursor <= dataFim) {
      dias.push({
        data: cursor.toISOString().slice(0, 10),
        entradas: 0,
        saidas: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const titulo of titulosAbertos) {
      const chave = new Date(titulo.vencimento).toISOString().slice(0, 10);
      const dia = dias.find((item) => item.data === chave);

      if (dia) {
        if (titulo.tipo === "receber") {
          dia.entradas += Number(titulo.valor);
        } else {
          dia.saidas += Number(titulo.valor);
        }
      }
    }

    let saldo = saldoInicial;

    return dias.map((dia) => {
      saldo += dia.entradas - dia.saidas;

      return {
        data: dia.data,
        entradas: dia.entradas,
        saidas: dia.saidas,
        saldoProjetado: saldo,
      };
    });
  }
}

module.exports = new FluxoCaixaService();
