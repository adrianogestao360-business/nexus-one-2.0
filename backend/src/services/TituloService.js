const TituloRepository = require("../repositories/TituloRepository");
const ClienteRepository = require("../repositories/ClienteRepository");
const FornecedorRepository = require("../repositories/FornecedorRepository");

class TituloService {
  async listar(empresaId, filtros) {
    return TituloRepository.listar(empresaId, filtros);
  }

  async buscarPorId(id, empresaId) {
    const titulo = await TituloRepository.findById(id, empresaId);

    if (!titulo) {
      throw this.#naoEncontrado();
    }

    return titulo;
  }

  async criar(data, empresaId) {
    const { tipo, descricao, valor, vencimento, clienteId, fornecedorId } =
      data;

    if (tipo !== "pagar" && tipo !== "receber") {
      const error = new Error('Tipo deve ser "pagar" ou "receber".');
      error.status = 400;
      throw error;
    }

    if (!descricao || !valor || Number(valor) <= 0 || !vencimento) {
      const error = new Error(
        "Descrição, valor maior que zero e vencimento são obrigatórios.",
      );
      error.status = 400;
      throw error;
    }

    if (clienteId) {
      const cliente = await ClienteRepository.findById(
        Number(clienteId),
        empresaId,
      );

      if (!cliente) {
        const error = new Error("Cliente não encontrado.");
        error.status = 404;
        throw error;
      }
    }

    if (fornecedorId) {
      const fornecedor = await FornecedorRepository.findById(
        Number(fornecedorId),
        empresaId,
      );

      if (!fornecedor) {
        const error = new Error("Fornecedor não encontrado.");
        error.status = 404;
        throw error;
      }
    }

    return TituloRepository.criar({
      tipo,
      descricao,
      valor: Number(valor),
      vencimento: new Date(vencimento),
      empresaId,
      clienteId: clienteId ? Number(clienteId) : null,
      fornecedorId: fornecedorId ? Number(fornecedorId) : null,
    });
  }

  async baixar(id, empresaId) {
    const titulo = await this.buscarPorId(id, empresaId);

    if (titulo.status !== "aberta") {
      const error = new Error("Só é possível baixar um título em aberto.");
      error.status = 400;
      throw error;
    }

    return TituloRepository.baixar(id);
  }

  async cancelar(id, empresaId) {
    const titulo = await this.buscarPorId(id, empresaId);

    if (titulo.status !== "aberta") {
      const error = new Error("Só é possível cancelar um título em aberto.");
      error.status = 400;
      throw error;
    }

    return TituloRepository.cancelar(id);
  }

  #naoEncontrado() {
    const error = new Error("Título não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new TituloService();
