const AuthService = require("../services/AuthService");

class AuthController {
  async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const resultado = await AuthService.login(email, senha);

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
}

module.exports = new AuthController();