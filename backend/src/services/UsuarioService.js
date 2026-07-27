const bcrypt = require("bcrypt");

const UsuarioRepository = require("../repositories/UsuarioRepository");
const PapelRepository = require("../repositories/PapelRepository");
const UsuarioDTO = require("../dto/UsuarioDTO");

class UsuarioService {
  async listar(empresaId) {
    const usuarios = await UsuarioRepository.listar(empresaId);

    return UsuarioDTO.toCollection(usuarios);
  }

  async buscarPorId(id, empresaId) {
    const usuario = await UsuarioRepository.findById(id, empresaId);

    if (!usuario) {
      throw this.#naoEncontrado();
    }

    return UsuarioDTO.toResponse(usuario);
  }

  async criar(data, empresaId) {
    const { nome, email, senha, papelIds } = data;

    if (!nome || !email || !senha) {
      throw this.#dadosObrigatorios();
    }

    this.#validarPapelIds(papelIds);
    await this.#validarPapeisDaEmpresa(papelIds, empresaId);

    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await UsuarioRepository.criar({
      nome,
      email,
      senha: senhaHash,
      empresaId,
      papelIds,
    });

    return this.buscarPorId(usuario.id, empresaId);
  }

  async atualizar(id, data, empresaId) {
    await this.buscarPorId(id, empresaId);

    const { nome, email, senha, ativo, papelIds } = data;

    if (!nome || !email) {
      const error = new Error("Nome e e-mail são obrigatórios.");
      error.status = 400;
      throw error;
    }

    this.#validarPapelIds(papelIds);
    await this.#validarPapeisDaEmpresa(papelIds, empresaId);

    const dados = { nome, email, ativo, papelIds };

    if (senha) {
      dados.senha = await bcrypt.hash(senha, 12);
    }

    await UsuarioRepository.atualizar(id, dados);

    return this.buscarPorId(id, empresaId);
  }

  async desativar(id, empresaId) {
    await this.buscarPorId(id, empresaId);

    return UsuarioRepository.desativar(id);
  }

  async alterarSenha(usuarioId, senhaAtual, novaSenha) {
    if (!senhaAtual || !novaSenha) {
      const error = new Error("Senha atual e nova senha são obrigatórias.");
      error.status = 400;
      throw error;
    }

    if (novaSenha.length < 8) {
      const error = new Error(
        "A nova senha precisa ter pelo menos 8 caracteres.",
      );
      error.status = 400;
      throw error;
    }

    const usuario = await UsuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw this.#naoEncontrado();
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      const error = new Error("Senha atual incorreta.");
      error.status = 401;
      throw error;
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);

    await UsuarioRepository.atualizar(usuarioId, { senha: senhaHash });
  }

  #validarPapelIds(papelIds) {
    if (papelIds !== undefined && !Array.isArray(papelIds)) {
      const error = new Error("papelIds precisa ser uma lista.");
      error.status = 400;
      throw error;
    }
  }

  async #validarPapeisDaEmpresa(papelIds, empresaId) {
    if (!papelIds?.length) {
      return;
    }

    for (const papelId of papelIds) {
      const papel = await PapelRepository.findById(
        Number(papelId),
        empresaId,
      );

      if (!papel) {
        const error = new Error("Papel não encontrado.");
        error.status = 404;
        throw error;
      }
    }
  }

  #dadosObrigatorios() {
    const error = new Error("Nome, e-mail e senha são obrigatórios.");
    error.status = 400;
    return error;
  }

  #naoEncontrado() {
    const error = new Error("Usuário não encontrado.");
    error.status = 404;
    return error;
  }
}

module.exports = new UsuarioService();
