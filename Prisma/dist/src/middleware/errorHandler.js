"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    const message = err.message || "Internal server error.";
    console.error(`[ERROR] ${statusCode} - ${message}`);
    res.status(statusCode).json({
        responseStatus: 0,
        message,
    });
};
exports.errorHandler = errorHandler;
