import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.config";
import { RegisterInput, LoginInput } from "../model/models";
import { JwtPayload } from "../types";

// In-memory token blacklist for logout (stateless JWT + blacklist approach)
// In production this would be Redis; for this scope a Set is sufficient
const blacklistedTokens = new Set<string>();

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerUser = async (data: RegisterInput) => {
  const { name, email, password } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err: Error & { statusCode?: number } = new Error(
      "Email is already registered."
    );
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUser = async (data: LoginInput) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: Error & { statusCode?: number } = new Error(
      "Invalid email or password."
    );
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err: Error & { statusCode?: number } = new Error(
      "Invalid email or password."
    );
    err.statusCode = 401;
    throw err;
  }

  const payload: JwtPayload = { userId: user.id, email: user.email };
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

  const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutUser = (token: string): void => {
  blacklistedTokens.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};