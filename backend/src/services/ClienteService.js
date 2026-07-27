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
    const {
      nome,
      documento,
      email,
      telefone,
      tipoDocumento,
      logradouro,
      numero,
      complemento,
      bairro,
      municipio,
      codigoMunicipioIBGE,
      uf,
      cep,
      limiteCredito,
    } = data;

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
      tipoDocumento: tipoDocumento || null,
      logradouro: logradouro || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      municipio: municipio || null,
      codigoMunicipioIBGE: codigoMunicipioIBGE || null,
      uf: uf || null,
      cep: cep || null,
      limiteCredito:
        limiteCredito !== undefined && limiteCredito !== ""
          ? Number(limiteCredito)
          : null,
    };
  }

  #naoEncontrado() {
    const error = new Error("Cliente não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new ClienteService();
