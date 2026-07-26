const AuthService = require("../services/AuthService");
const AuditoriaService = require("../services/AuditoriaService");

class AuthController {
  async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    let resultado;

    try {
      resultado = await AuthService.login(email, senha);
    } catch (error) {
      await AuditoriaService.registrarLoginFalho(email, req.ip);
      throw error;
    }

    await AuditoriaService.registrar({
      empresaId: resultado.usuario.empresaId,
      usuarioId: resultado.usuario.id,
      acao: "login",
      entidade: "Usuario",
      entidadeId: resultado.usuario.id,
      ip: req.ip,
    });

    return res.status(200).json(resultado);
  }

  async refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token é obrigatório.",
      });
    }

    const resultado = await AuthService.refresh(refreshToken);

    return res.status(200).json(resultado);
  }

  async logout(req, res) {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    return res.status(204).send();
  }

  async minhasEmpresas(req, res) {
    const empresas = await AuthService.listarEmpresasDisponiveis(
      req.usuario.sub,
    );

    return res.json(empresas);
  }

  async trocarEmpresa(req, res) {
    const { empresaId } = req.body;

    if (!empresaId) {
      return res.status(400).json({
        message: "empresaId é obrigatório.",
      });
    }

    const resultado = await AuthService.trocarEmpresa(
      req.usuario.sub,
      Number(empresaId),
    );

    return res.status(200).json(resultado);
  }
}

module.exports = new AuthController();