"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteParam = exports.sendSuccess = exports.asyncHandler = void 0;
const service_util_1 = require("../service/service.util");
const asyncHandler = (handler) => (req, res, next) => {
    void handler(req, res, next).catch(next);
};
exports.asyncHandler = asyncHandler;
const sendSuccess = (res, message, result, statusCode = 200) => {
    const payload = {
        responseStatus: 1,
        message,
        result,
    };
    return res.status(statusCode).json(payload);
};
exports.sendSuccess = sendSuccess;
const getRouteParam = (value, name) => {
    if (!value || Array.isArray(value)) {
        throw (0, service_util_1.createHttpError)(`Invalid route parameter: ${name}.`, 400);
    }
    return value;
};
exports.getRouteParam = getRouteParam;
