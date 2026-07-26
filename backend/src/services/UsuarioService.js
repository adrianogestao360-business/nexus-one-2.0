const bcrypt = require("bcrypt");

const UsuarioRepository = require("../repositories/UsuarioRepository");
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
    const { nome, email, senha, papelId } = data;

    if (!nome || !email || !senha) {
      throw this.#dadosObrigatorios();
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await UsuarioRepository.criar({
      nome,
      email,
      senha: senhaHash,
      empresaId,
      papelId,
    });

    return this.buscarPorId(usuario.id, empresaId);
  }

  async atualizar(id, data, empresaId) {
    await this.buscarPorId(id, empresaId);

    const { nome, email, senha, ativo, papelId } = data;

    if (!nome || !email) {
      const error = new Error("Nome e e-mail são obrigatórios.");
      error.status = 400;
      throw error;
    }

    const dados = { nome, email, ativo, papelId };

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
