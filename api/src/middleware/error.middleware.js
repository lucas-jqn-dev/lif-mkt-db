function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
}

function errorHandler(error, _req, res, _next) {
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Id invalido" });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "El valor ya existe y debe ser unico" });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Error de validacion",
      details: Object.values(error.errors).map((item) => item.message)
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Error interno del servidor"
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
