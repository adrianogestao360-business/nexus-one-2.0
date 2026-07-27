const VeiculoRepository = require("../repositories/VeiculoRepository");

class VeiculoService {
  async listar(empresaId) {
    return VeiculoRepository.listar(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const veiculo = await VeiculoRepository.findById(id, empresaId);

    if (!veiculo) {
      throw this.#naoEncontrado();
    }

    return veiculo;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);

    return VeiculoRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return VeiculoRepository.atualizar(id, dados);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return VeiculoRepository.desativar(id);
  }

  #sanitizar(data) {
    const { placa, modelo, capacidade, kmMedioPorLitro, status } = data;

    if (!placa || !modelo) {
      const error = new Error("Placa e modelo são obrigatórios.");
      error.status = 400;
      throw error;
    }

    return {
      placa,
      modelo,
      capacidade: capacidade || null,
      kmMedioPorLitro:
        kmMedioPorLitro !== undefined && kmMedioPorLitro !== ""
          ? Number(kmMedioPorLitro)
          : null,
      status: status || "disponivel",
    };
  }

  #naoEncontrado() {
    const error = new Error("Veículo não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new VeiculoService();
