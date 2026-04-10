import { Request, Response, NextFunction } from "express";
import * as AuthService from "../service/auth.service";
import { ApiResponse } from "../types";

const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({
        responseStatus: 0,
        message: "Name, email, and password are required.",
      } as ApiResponse);
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      res.status(400).json({
        responseStatus: 0,
        message:
          "Password must be at least 8 characters and include letters, numbers, and a special character.",
      } as ApiResponse);
      return;
    }

    const user = await AuthService.registerUser({ name, email, password });

    res.status(201).json({
      responseStatus: 1,
      message: "User registered successfully.",
      result: user,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        responseStatus: 0,
        message: "Email and password are required.",
      } as ApiResponse);
      return;
    }

    const result = await AuthService.loginUser({ email, password });

    res.status(200).json({
      responseStatus: 1,
      message: "Login successful.",
      result,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1] as string;
    AuthService.logoutUser(token);
    res.status(200).json({
      responseStatus: 1,
      message: "Logged out successfully.",
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};
