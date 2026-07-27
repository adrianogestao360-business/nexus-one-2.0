const CargoRepository = require("../repositories/CargoRepository");

class CargoService {
  async listar(empresaId) {
    return CargoRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const cargo = await CargoRepository.findById(id, empresaId);

    if (!cargo) {
      throw this.#naoEncontrado();
    }

    return cargo;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);

    return CargoRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return CargoRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return CargoRepository.desativar(id);
  }

  #sanitizar(data) {
    const { nome, descricao } = data;

    if (!nome) {
      const error = new Error("Nome é obrigatório.");
      error.status = 400;
      throw error;
    }

    return {
      nome,
      descricao: descricao || null,
    };
  }

  #naoEncontrado() {
    const error = new Error("Cargo não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new CargoService();
