const EmpresaRepository = require("../repositories/EmpresaRepository");

class EmpresaService {
  async listar() {
    return EmpresaRepository.findAll();
  }

  async buscarPorId(id) {
    const empresa = await EmpresaRepository.findById(id);

    if (!empresa) {
      throw this.#naoEncontrada();
    }

    return empresa;
  }

  async criar(data) {
    const dados = this.#sanitizar(data);

    return EmpresaRepository.create(dados);
  }

  async atualizar(id, data) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id);

    return EmpresaRepository.update(id, dados);
  }

  async desativar(id) {
    await this.buscarPorId(id);

    return EmpresaRepository.desativar(id);
  }

  #sanitizar(data) {
    const { razaoSocial, nomeFantasia, cnpj, email, telefone } = data;

    if (!razaoSocial || !nomeFantasia || !cnpj) {
      const error = new Error(
        "Razão social, nome fantasia e CNPJ são obrigatórios.",
      );
      error.status = 400;
      throw error;
    }

    return { razaoSocial, nomeFantasia, cnpj, email, telefone };
  }

  #naoEncontrada() {
    const error = new Error("Empresa não encontrada.");
    error.status = 404;
    return error;
  }
}

module.exports = new EmpresaService();