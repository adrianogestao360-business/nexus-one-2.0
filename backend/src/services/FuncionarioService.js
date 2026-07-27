const FuncionarioRepository = require("../repositories/FuncionarioRepository");
const CargoRepository = require("../repositories/CargoRepository");

class FuncionarioService {
  async listar(empresaId) {
    return FuncionarioRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const funcionario = await FuncionarioRepository.findById(id, empresaId);

    if (!funcionario) {
      throw this.#naoEncontrado();
    }

    return funcionario;
  }

  async criar(data, empresaId) {
    const dados = await this.#sanitizar(data, empresaId);

    return FuncionarioRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = await this.#sanitizar(data, empresaId);

    await this.buscarPorId(id, empresaId);

    return FuncionarioRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return FuncionarioRepository.desativar(id);
  }

  async #sanitizar(data, empresaId) {
    const { nome, cargoId, salarioBase, dataAdmissao, email, telefone } =
      data;

    if (!nome) {
      const error = new Error("Nome é obrigatório.");
      error.status = 400;
      throw error;
    }

    if (!salarioBase || Number(salarioBase) <= 0) {
      const error = new Error("Salário base deve ser maior que zero.");
      error.status = 400;
      throw error;
    }

    if (cargoId) {
      const cargo = await CargoRepository.findById(
        Number(cargoId),
        empresaId,
      );

      if (!cargo) {
        const error = new Error("Cargo não encontrado.");
        error.status = 404;
        throw error;
      }
    }

    return {
      nome,
      cargoId: cargoId ? Number(cargoId) : null,
      salarioBase: Number(salarioBase),
      dataAdmissao: dataAdmissao ? new Date(dataAdmissao) : undefined,
      email: email || null,
      telefone: telefone || null,
    };
  }

  #naoEncontrado() {
    const error = new Error("Funcionário não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new FuncionarioService();
