import { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiResponse } from "../types";
import { createHttpError } from "../service/service.util";

export const asyncHandler =
  (
    handler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>
  ): RequestHandler =>
  (req, res, next) => {
    void handler(req, res, next).catch(next);
  };

export const sendSuccess = <T>(
  res: Response,
  message: string,
  result: T,
  statusCode = 200
) => {
  const payload: ApiResponse<T> = {
    responseStatus: 1,
    message,
    result,
  };

  return res.status(statusCode).json(payload);
};

export const getRouteParam = (value: string | string[] | undefined, name: string) => {
  if (!value || Array.isArray(value)) {
    throw createHttpError(`Invalid route parameter: ${name}.`, 400);
  }

  return value;
};
