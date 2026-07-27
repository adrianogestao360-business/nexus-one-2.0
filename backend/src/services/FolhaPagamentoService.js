const FolhaPagamentoRepository = require("../repositories/FolhaPagamentoRepository");
const FuncionarioRepository = require("../repositories/FuncionarioRepository");

class FolhaPagamentoService {
  async listar(empresaId) {
    return FolhaPagamentoRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const folha = await FolhaPagamentoRepository.findById(id, empresaId);

    if (!folha) {
      throw this.#naoEncontrado();
    }

    return folha;
  }

  async criar(data, empresaId) {
    const { mes, ano } = data;

    if (!mes || mes < 1 || mes > 12 || !ano) {
      const error = new Error("Mês (1-12) e ano são obrigatórios.");
      error.status = 400;
      throw error;
    }

    const existente = await FolhaPagamentoRepository.findByMesAno(
      Number(mes),
      Number(ano),
      empresaId,
    );

    if (existente) {
      const error = new Error(
        "Já existe uma folha de pagamento para este mês/ano.",
      );
      error.status = 400;
      throw error;
    }

    const funcionarios = await FuncionarioRepository.listar(empresaId);
    const funcionariosAtivos = funcionarios.filter((f) => f.ativo);

    if (funcionariosAtivos.length === 0) {
      const error = new Error(
        "Não há funcionários ativos para gerar a folha de pagamento.",
      );
      error.status = 400;
      throw error;
    }

    return FolhaPagamentoRepository.criarComItens(
      { mes: Number(mes), ano: Number(ano), empresaId },
      funcionariosAtivos,
    );
  }

  async atualizarItem(itemId, data, empresaId) {
    const item = await FolhaPagamentoRepository.findItemById(
      itemId,
      empresaId,
    );

    if (!item) {
      const error = new Error("Item de folha de pagamento não encontrado.");
      error.status = 404;
      throw error;
    }

    if (item.folha.status !== "aberta") {
      const error = new Error(
        "Só é possível editar itens de uma folha em aberto.",
      );
      error.status = 400;
      throw error;
    }

    const proventos = Number(data.proventos);
    const descontos = data.descontos ? Number(data.descontos) : 0;

    if (!proventos || proventos <= 0) {
      const error = new Error("Proventos deve ser maior que zero.");
      error.status = 400;
      throw error;
    }

    if (descontos < 0) {
      const error = new Error("Descontos não pode ser negativo.");
      error.status = 400;
      throw error;
    }

    return FolhaPagamentoRepository.atualizarItem(itemId, {
      proventos,
      descontos,
      valorLiquido: proventos - descontos,
    });
  }

  async fechar(id, empresaId) {
    const folha = await this.buscarPorId(id, empresaId);

    if (folha.status !== "aberta") {
      const error = new Error("Só é possível fechar uma folha em aberto.");
      error.status = 400;
      throw error;
    }

    const vencimento = new Date(folha.ano, folha.mes, 5);

    const itensParaTitulo = folha.itens.map((item) => ({
      id: item.id,
      descricao: `Folha ${String(folha.mes).padStart(2, "0")}/${folha.ano} - ${item.funcionario.nome}`,
      valor: item.valorLiquido,
      vencimento,
    }));

    return FolhaPagamentoRepository.fecharComTitulos({
      folhaId: id,
      empresaId,
      itensParaTitulo,
    });
  }

  #naoEncontrado() {
    const error = new Error("Folha de pagamento não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new FolhaPagamentoService();
