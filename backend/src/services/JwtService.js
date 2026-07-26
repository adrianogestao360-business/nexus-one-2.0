const jwt = require("jsonwebtoken");

class JwtService {
  gerarAccessToken(usuario, permissoes = []) {
    return jwt.sign(
      {
        sub: usuario.id,
        empresaId: usuario.empresaId,
        email: usuario.email,
        permissoes,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );
  }

  gerarRefreshToken(usuario) {
    return jwt.sign(
      {
        sub: usuario.id,
        empresaId: usuario.empresaId,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }
    );
  }

  validarAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  validarRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }
}

module.exports = new JwtService();