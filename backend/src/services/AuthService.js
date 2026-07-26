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

    // usa a empresa ativa gravada no próprio refresh token (não a empresa "casa"
    // do usuário), para que uma troca de empresa sobreviva à renovação silenciosa
    const empresaId = payload.empresaId;

    const temAcesso = usuario.usuarioPapeis.some(
      (usuarioPapel) => usuarioPapel.papel.empresaId === empresaId,
    );

    if (!temAcesso) {
      throw this.#refreshInvalido();
    }

    const usuarioComEmpresaAtiva = { ...usuario, empresaId };
    const permissoes = this.#extrairPermissoes(usuarioComEmpresaAtiva, empresaId);

    const novoAccessToken = JwtService.gerarAccessToken(
      usuarioComEmpresaAtiva,
      permissoes,
    );
    const novoRefreshToken = JwtService.gerarRefreshToken(
      usuarioComEmpresaAtiva,
    );

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
          empresaId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      accessToken: novoAccessToken,
      refreshToken: novoRefreshToken,
    };
  }

  async listarEmpresasDisponiveis(usuarioId) {
    const usuario = await UsuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw this.#refreshInvalido();
    }

    const empresaIds = [
      ...new Set(
        usuario.usuarioPapeis.map(
          (usuarioPapel) => usuarioPapel.papel.empresaId,
        ),
      ),
    ];

    return prisma.empresa.findMany({
      where: {
        id: { in: empresaIds },
        ativo: true,
      },
      orderBy: {
        razaoSocial: "asc",
      },
    });
  }

  async trocarEmpresa(usuarioId, empresaId) {
    const usuario = await UsuarioRepository.buscarPorId(usuarioId);

    if (!usuario || !usuario.ativo) {
      throw this.#credenciaisInvalidas();
    }

    const temAcesso = usuario.usuarioPapeis.some(
      (usuarioPapel) => usuarioPapel.papel.empresaId === empresaId,
    );

    if (!temAcesso) {
      const error = new Error("Você não tem acesso a esta empresa.");
      error.status = 403;
      throw error;
    }

    const usuarioComEmpresaAtiva = { ...usuario, empresaId };
    const permissoes = this.#extrairPermissoes(usuarioComEmpresaAtiva, empresaId);

    const accessToken = JwtService.gerarAccessToken(
      usuarioComEmpresaAtiva,
      permissoes,
    );
    const refreshToken = JwtService.gerarRefreshToken(usuarioComEmpresaAtiva);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuarioId: usuario.id,
        empresaId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        empresaId,
        permissoes,
      },
      accessToken,
      refreshToken,
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

  #extrairPermissoes(usuario, empresaId = usuario.empresaId) {
    const codigos =
      usuario.usuarioPapeis
        ?.filter((usuarioPapel) => usuarioPapel.papel.empresaId === empresaId)
        .flatMap((usuarioPapel) =>
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