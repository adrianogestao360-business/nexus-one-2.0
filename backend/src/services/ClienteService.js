const ClienteRepository = require("../repositories/ClienteRepository");

class ClienteService {
  async listar(empresaId) {
    return ClienteRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const cliente = await ClienteRepository.findById(id, empresaId);

    if (!cliente) {
      throw this.#naoEncontrado();
    }

    return cliente;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);

    return ClienteRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return ClienteRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return ClienteRepository.desativar(id);
  }

  #sanitizar(data) {
    const { nome, documento, email, telefone } = data;

    if (!nome) {
      const error = new Error("Nome é obrigatório.");
      error.status = 400;
      throw error;
    }

    return {
      nome,
      documento: documento || null,
      email: email || null,
      telefone: telefone || null,
    };
  }

  #naoEncontrado() {
    const error = new Error("Cliente não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new ClienteService();
