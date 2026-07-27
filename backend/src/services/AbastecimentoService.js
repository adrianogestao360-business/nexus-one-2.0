const AbastecimentoRepository = require("../repositories/AbastecimentoRepository");
const VeiculoRepository = require("../repositories/VeiculoRepository");

class AbastecimentoService {
  async listar(veiculoId, empresaId) {
    await this.#buscarVeiculo(veiculoId, empresaId);

    return AbastecimentoRepository.listar(veiculoId, empresaId);
  }

  async criar(veiculoId, data, empresaId) {
    await this.#buscarVeiculo(veiculoId, empresaId);

    const { valorLitro, litros } = data;

    if (!valorLitro || Number(valorLitro) <= 0) {
      const error = new Error("Valor por litro é obrigatório e deve ser maior que zero.");
      error.status = 400;
      throw error;
    }

    return AbastecimentoRepository.criar({
      veiculoId,
      empresaId,
      valorLitro: Number(valorLitro),
      litros: litros !== undefined && litros !== "" ? Number(litros) : null,
    });
  }

  async #buscarVeiculo(veiculoId, empresaId) {
    const veiculo = await VeiculoRepository.findById(veiculoId, empresaId);

    if (!veiculo) {
      const error = new Error("Veículo não encontrado.");
      error.status = 404;
      throw error;
    }

    return veiculo;
  }
}

module.exports = new AbastecimentoService();
