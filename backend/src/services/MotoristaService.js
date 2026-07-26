const MotoristaRepository = require("../repositories/MotoristaRepository");

class MotoristaService {
  async listar(empresaId) {
    return MotoristaRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const motorista = await MotoristaRepository.findById(id, empresaId);

    if (!motorista) {
      throw this.#naoEncontrado();
    }

    return motorista;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);

    return MotoristaRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return MotoristaRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return MotoristaRepository.desativar(id);
  }

  #sanitizar(data) {
    const { nome, cnh, telefone } = data;

    if (!nome) {
      const error = new Error("Nome é obrigatório.");
      error.status = 400;
      throw error;
    }

    return {
      nome,
      cnh: cnh || null,
      telefone: telefone || null,
    };
  }

  #naoEncontrado() {
    const error = new Error("Motorista não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new MotoristaService();
