import { AppError } from "../types";

export const createHttpError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
};

export const requireFields = (
  entries: Array<[string, unknown]>,
  message = "Enter valid data."
) => {
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
    throw createHttpError(message, 400);
  }
};

export const ensureFound = <T>(
  value: T | null,
  message: string,
  statusCode = 404
): T => {
  if (!value) {
    throw createHttpError(message, statusCode);
  }

  return value;
};
