class PermissionMiddleware {
  handle(codigo) {
    return (req, res, next) => {
      const permissoes = req.usuario?.permissoes || [];

      if (!permissoes.includes(codigo)) {
        return res.status(403).json({
          message: "Você não tem permissão para executar esta ação.",
        });
      }

      return next();
    };
  }
}

module.exports = new PermissionMiddleware();
