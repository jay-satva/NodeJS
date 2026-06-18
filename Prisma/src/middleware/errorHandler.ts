import { NextFunction, Request, Response } from "express";
import { AppError } from "../types";

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message || "Internal server error.";

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    responseStatus: 0,
    message,
  });
};
