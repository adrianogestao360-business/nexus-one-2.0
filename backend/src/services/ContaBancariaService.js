const ContaBancariaRepository = require("../repositories/ContaBancariaRepository");

class ContaBancariaService {
  async listar(empresaId) {
    const contas = await ContaBancariaRepository.listar(empresaId);

    return Promise.all(contas.map((conta) => this.#comSaldo(conta)));
  }

  async buscarPorId(id, empresaId) {
    const conta = await ContaBancariaRepository.findById(id, empresaId);

    if (!conta) {
      throw this.#naoEncontrada();
    }

    return conta;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);

    return ContaBancariaRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return ContaBancariaRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return ContaBancariaRepository.desativar(id);
  }

  async calcularSaldoAtual(conta) {
    const [totalRecebido, totalPago] = await Promise.all([
      ContaBancariaRepository.somarTitulosPagos(conta.id, "receber"),
      ContaBancariaRepository.somarTitulosPagos(conta.id, "pagar"),
    ]);

    return Number(conta.saldoInicial) + totalRecebido - totalPago;
  }

  async #comSaldo(conta) {
    const saldoAtual = await this.calcularSaldoAtual(conta);

    return { ...conta, saldoAtual };
  }

  #sanitizar(data) {
    const { nome, tipo, saldoInicial } = data;

    if (!nome) {
      const error = new Error("Nome é obrigatório.");
      error.status = 400;
      throw error;
    }

    if (tipo && tipo !== "banco" && tipo !== "caixa") {
      const error = new Error('Tipo deve ser "banco" ou "caixa".');
      error.status = 400;
      throw error;
    }

    return {
      nome,
      tipo: tipo || "banco",
      saldoInicial:
        saldoInicial !== undefined && saldoInicial !== ""
          ? Number(saldoInicial)
          : 0,
    };
  }

  #naoEncontrada() {
    const error = new Error("Conta bancária não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new ContaBancariaService();
