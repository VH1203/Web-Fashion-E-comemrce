// src/middlewares/errorMiddleware.js
function errorMiddleware(err, req, res, next) {
  // ===== Normalize base info =====
  let status =
    err.status ||
    err.statusCode ||
    (typeof err.code === "number" && err.code >= 400 ? err.code : 500);

  let message = err.message || "Internal Server Error";
  let errors = undefined;
  let code = err.code; // e.g., 'LIMIT_FILE_SIZE', Mongo 11000, etc.

  // ===== Special cases (Mongoose, Mongo, JWT, Multer, Joi, etc.) =====
  // Mongoose validation
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation error";
    errors = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
      kind: e.kind,
      value: e.value,
    }));
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongo duplicate key
  if (err.name === "MongoServerError" && err.code === 11000) {
    status = 409; // Conflict
    message = "Duplicate key";
    errors = [{ path: Object.keys(err.keyPattern || {}),
                message: `Duplicate value for ${Object.keys(err.keyValue || {}).join(", ")}` }];
  }

  // JWT
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // Multer file size / limits
  if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "File too large";
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    status = 400;
    message = "Unexpected file field";
  }

  // Joi / Celebrate style
  if (err.isJoi) {
    status = 400;
    message = "Validation error";
    errors = err.details?.map((d) => ({ path: d.path?.join("."),
                                        message: d.message })) || undefined;
  }

  // ===== Shape the response =====
  const isServerError = status >= 500;
  const payload = {
    status: isServerError ? "error" : "fail",
    message,
    code,
    errors,
    path: req.originalUrl,
    method: req.method,
    requestId: req.id || req.headers["x-request-id"],
    timestamp: new Date().toISOString(),
  };

  // Only expose stack in development
  if (process.env.NODE_ENV === "development" && err.stack) {
    payload.stack = err.stack;
  }

  // Log full error on server
  // (giữ nguyên log chi tiết để debug; có thể thay console.error bằng logger)
  console.error("🔥 Error Middleware:", {
    status,
    message,
    code,
    name: err.name,
    stack: err.stack,
  });

  res.status(status).json(payload);
}

module.exports = errorMiddleware;
