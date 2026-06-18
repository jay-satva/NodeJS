"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFound = exports.requireFields = exports.createHttpError = void 0;
const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
exports.createHttpError = createHttpError;
const requireFields = (entries, message = "Enter valid data.") => {
    const hasInvalidValue = entries.some(([, value]) => {
        if (value === undefined || value === null) {
            return true;
        }
        if (typeof value === "string") {
            return value.trim() === "";
        }
        return false;
    });
    if (hasInvalidValue) {
        throw (0, exports.createHttpError)(message, 400);
    }
};
exports.requireFields = requireFields;
const ensureFound = (value, message, statusCode = 404) => {
    if (!value) {
        throw (0, exports.createHttpError)(message, statusCode);
    }
    return value;
};
exports.ensureFound = ensureFound;
