const PapelRepository = require("../repositories/PapelRepository");

class PapelService {
  async listar(empresaId) {
    return PapelRepository.findAll(empresaId);
  }

  async buscarPorId(id, empresaId) {
    const papel = await PapelRepository.findById(id, empresaId);

    if (!papel) {
      throw this.#naoEncontrado();
    }

    return papel;
  }

  async criar(data, empresaId) {
    const dados = this.#sanitizar(data);

    return PapelRepository.criar({ ...dados, empresaId });
  }

  async atualizar(id, data, empresaId) {
    const dados = this.#sanitizar(data);

    await this.buscarPorId(id, empresaId);

    return PapelRepository.atualizar(id, dados);
  }

  async excluir(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    const usuariosVinculados =
      await PapelRepository.contarUsuariosVinculados(id);

    if (usuariosVinculados > 0) {
      const error = new Error(
        "Não é possível excluir um papel com usuários vinculados.",
      );
      error.status = 400;
      throw error;
    }

    return PapelRepository.excluir(id);
  }

  async definirPermissoes(id, permissaoIds, empresaId) {
    await this.buscarPorId(id, empresaId);

    if (!Array.isArray(permissaoIds)) {
      const error = new Error("permissaoIds precisa ser uma lista.");
      error.status = 400;
      throw error;
    }

    await PapelRepository.sincronizarPermissoes(
      id,
      permissaoIds.map((permissaoId) => Number(permissaoId)),
    );

    return this.buscarPorId(id, empresaId);
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
    const error = new Error("Papel não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new PapelService();
