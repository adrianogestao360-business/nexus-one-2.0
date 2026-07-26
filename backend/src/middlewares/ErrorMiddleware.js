// eslint-disable-next-line no-unused-vars
function ErrorMiddleware(error, req, res, next) {
  if (error.code === "P2002") {
    return res.status(409).json({
      message: "Já existe um registro com esse valor único.",
    });
  }

  const status = error.status || 500;

  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json({
    message: status === 500 ? "Erro interno do servidor." : error.message,
  });
}

module.exports = ErrorMiddleware;
