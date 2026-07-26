const bcrypt = require("bcrypt");

const UsuarioRepository = require("../repositories/UsuarioRepository");
const JwtService = require("./JwtService");
const prisma = require("../config/prisma");

class AuthService {
  async login(email, senha) {
    const usuario = await UsuarioRepository.buscarPorEmail(email);

    if (!usuario || !usuario.ativo) {
      throw this.#credenciaisInvalidas();
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw this.#credenciaisInvalidas();
    }

    const permissoes = this.#extrairPermissoes(usuario);

    const accessToken = JwtService.gerarAccessToken(usuario, permissoes);
    const refreshToken = JwtService.gerarRefreshToken(usuario);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuarioId: usuario.id,
        empresaId: usuario.empresaId,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        empresaId: usuario.empresaId,
        permissoes,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken) {
    let payload;

    try {
      payload = JwtService.validarRefreshToken(refreshToken);
    } catch {
      throw this.#refreshInvalido();
    }

    const tokenSalvo = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if (
      !tokenSalvo ||
      tokenSalvo.revokedAt ||
      tokenSalvo.expiresAt < new Date()
    ) {
      throw this.#refreshInvalido();
    }

    const usuario = await UsuarioRepository.buscarPorId(payload.sub);

    if (!usuario || !usuario.ativo) {
      throw this.#refreshInvalido();
    }

    const permissoes = this.#extrairPermissoes(usuario);

    const novoAccessToken = JwtService.gerarAccessToken(usuario, permissoes);
    const novoRefreshToken = JwtService.gerarRefreshToken(usuario);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: {
          token: refreshToken,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
      prisma.refreshToken.create({
        data: {
          token: novoRefreshToken,
          usuarioId: usuario.id,
          empresaId: usuario.empresaId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      accessToken: novoAccessToken,
      refreshToken: novoRefreshToken,
    };
  }

  async logout(refreshToken) {
    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  #extrairPermissoes(usuario) {
    const codigos =
      usuario.usuarioPapeis?.flatMap((usuarioPapel) =>
        usuarioPapel.papel.papelPermissoes.map(
          (papelPermissao) => papelPermissao.permissao.codigo,
        ),
      ) || [];

    return [...new Set(codigos)];
  }

  #credenciaisInvalidas() {
    const error = new Error("Usuário ou senha inválidos.");
    error.status = 401;
    return error;
  }

  #refreshInvalido() {
    const error = new Error("Refresh token inválido ou expirado.");
    error.status = 401;
    return error;
  }
}

module.exports = new AuthService();