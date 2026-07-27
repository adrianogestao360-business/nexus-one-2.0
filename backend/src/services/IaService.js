const prisma = require("../config/prisma");
const AnthropicClient = require("../integrations/anthropic/AnthropicClient");

const MODELO_PADRAO = "claude-sonnet-4-5-20250929";

class IaService {
  async obterResumo(empresaId) {
    const [
      pedidosAguardandoSeparacao,
      clientesAcimaDoLimite,
      produtosSemEstoque,
      veiculosEmManutencao,
      faturamento,
    ] = await Promise.all([
      prisma.separacao.count({
        where: { empresaId, status: { in: ["pendente", "em_separacao"] } },
      }),
      this.#obterClientesAcimaDoLimite(empresaId),
      prisma.produto.count({
        where: { empresaId, ativo: true, estoque: 0 },
      }),
      prisma.veiculo.count({
        where: { empresaId, ativo: true, status: "manutencao" },
      }),
      this.#obterFaturamentoVsMeta(empresaId),
    ]);

    return {
      pedidosAguardandoSeparacao,
      clientesAcimaDoLimite: clientesAcimaDoLimite.length,
      clientesAcimaDoLimiteDetalhe: clientesAcimaDoLimite,
      produtosSemEstoque,
      veiculosEmManutencao,
      faturamento,
    };
  }

  async gerarPlanoDeAcao(empresaId) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const error = new Error(
        "Configure ANTHROPIC_API_KEY no backend para habilitar o assistente de IA.",
      );
      error.status = 400;
      throw error;
    }

    const resumo = await this.obterResumo(empresaId);
    const prompt = this.#montarPrompt(resumo);

    const texto = await AnthropicClient.enviarMensagem(prompt, {
      apiKey,
      model: process.env.ANTHROPIC_MODEL || MODELO_PADRAO,
    });

    return { plano: texto };
  }

  async #obterClientesAcimaDoLimite(empresaId) {
    const clientes = await prisma.cliente.findMany({
      where: { empresaId, ativo: true, limiteCredito: { not: null } },
      select: { id: true, nome: true, limiteCredito: true },
    });

    const resultado = [];

    for (const cliente of clientes) {
      const titulosAbertos = await prisma.titulo.aggregate({
        where: {
          empresaId,
          clienteId: cliente.id,
          tipo: "receber",
          status: "aberta",
        },
        _sum: { valor: true },
      });

      const totalAberto = Number(titulosAbertos._sum.valor || 0);
      const limite = Number(cliente.limiteCredito);

      if (totalAberto > limite) {
        resultado.push({ nome: cliente.nome, totalAberto, limite });
      }
    }

    return resultado;
  }

  async #obterFaturamentoVsMeta(empresaId) {
    const agora = new Date();

    const [metas, realizado] = await Promise.all([
      prisma.metaVenda.aggregate({
        where: { empresaId, mes: agora.getMonth() + 1, ano: agora.getFullYear() },
        _sum: { valorMeta: true },
      }),
      prisma.venda.aggregate({
        where: {
          empresaId,
          status: "confirmada",
          createdAt: {
            gte: new Date(agora.getFullYear(), agora.getMonth(), 1),
          },
        },
        _sum: { total: true },
      }),
    ]);

    const valorMeta = Number(metas._sum.valorMeta || 0);
    const valorRealizado = Number(realizado._sum.total || 0);

    return {
      valorMeta,
      valorRealizado,
      percentual: valorMeta > 0 ? (valorRealizado / valorMeta) * 100 : null,
    };
  }

  #montarPrompt(resumo) {
    return `Você é o assistente de gestão "Nexus AI" de um ERP brasileiro. Com base nos números de hoje da empresa, escreva um plano de ação curto e priorizado (no máximo 5 itens, em português, tom direto e prático para um administrador de empresa):

- Pedidos aguardando separação: ${resumo.pedidosAguardandoSeparacao}
- Clientes acima do limite de crédito: ${resumo.clientesAcimaDoLimite}
- Produtos sem estoque disponível: ${resumo.produtosSemEstoque}
- Veículos em manutenção: ${resumo.veiculosEmManutencao}
- Faturamento do mês: R$ ${resumo.faturamento.valorRealizado.toFixed(2)} de uma meta de R$ ${resumo.faturamento.valorMeta.toFixed(2)}${resumo.faturamento.percentual !== null ? ` (${resumo.faturamento.percentual.toFixed(1)}%)` : ""}

Priorize o que exige ação mais urgente primeiro.`;
  }
}

module.exports = new IaService();
