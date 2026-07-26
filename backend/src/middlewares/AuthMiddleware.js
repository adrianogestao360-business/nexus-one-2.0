const JwtService = require("../services/JwtService");

class AuthMiddleware {
  async handle(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token não informado.",
      });
    }

    const [, token] = authHeader.split(" ");

    try {
      const payload = JwtService.validarAccessToken(token);

      req.usuario = payload;

      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Token inválido ou expirado.",
      });
    }
  }
}

module.exports = new AuthMiddleware();