const FornecedorRepository = require("../repositories/FornecedorRepository");

class FornecedorService {
  async listar(empresaId) {
    return FornecedorRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const fornecedor = await FornecedorRepository.findById(id, empresaId);

    if (!fornecedor) {
      throw this.#naoEncontrado();
    }

    return fornecedor;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);

    return FornecedorRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return FornecedorRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return FornecedorRepository.desativar(id);
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
    const error = new Error("Fornecedor não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new FornecedorService();
