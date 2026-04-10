import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { isTokenBlacklisted } from "../service/auth.service";
import { JwtPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      responseStatus: 0,
      message: "Access denied. No token provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (isTokenBlacklisted(token)) {
    res.status(401).json({
      responseStatus: 0,
      message: "Token has been invalidated.",
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      responseStatus: 0,
      message: "Invalid or expired token.",
    });
  }
};

export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.globalRole !== "SUPER_ADMIN") {
    res.status(403).json({
      responseStatus: 0,
      message: "Only super admins can perform this action.",
    });
    return;
  }

  next();
};

const resolveOrganizationId = (req: Request): string | null => {
  const orgIdFromParams = req.params.orgId;
  const orgIdFromBody =
    typeof req.body?.orgId === "string" ? req.body.orgId : null;

  if (typeof orgIdFromParams === "string" && orgIdFromParams.trim()) {
    return orgIdFromParams.trim();
  }

  if (orgIdFromBody?.trim()) {
    return orgIdFromBody.trim();
  }

  return null;
};

export const requireOrganizationAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const currentUser = req.user;

  if (!currentUser) {
    res.status(401).json({
      responseStatus: 0,
      message: "Authentication is required.",
    });
    return;
  }

  if (currentUser.globalRole === "SUPER_ADMIN") {
    next();
    return;
  }

  const orgId = resolveOrganizationId(req);

  if (!orgId) {
    res.status(400).json({
      responseStatus: 0,
      message: "Organization id is required.",
    });
    return;
  }

  const membership = await prisma.orgMember.findUnique({
    where: {
      userId_orgId: {
        userId: currentUser.userId,
        orgId,
      },
    },
  });

  if (!membership) {
    res.status(403).json({
      responseStatus: 0,
      message: "You do not have access to this organization.",
    });
    return;
  }

  next();
};

export const requireOrganizationAdminOrSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const currentUser = req.user;

  if (!currentUser) {
    res.status(401).json({
      responseStatus: 0,
      message: "Authentication is required.",
    });
    return;
  }

  if (currentUser.globalRole === "SUPER_ADMIN") {
    next();
    return;
  }

  const orgId = resolveOrganizationId(req);

  if (!orgId) {
    res.status(400).json({
      responseStatus: 0,
      message: "Organization id is required.",
    });
    return;
  }

  const membership = await prisma.orgMember.findUnique({
    where: {
      userId_orgId: {
        userId: currentUser.userId,
        orgId,
      },
    },
  });

  if (!membership || membership.role !== "ADMIN") {
    res.status(403).json({
      responseStatus: 0,
      message:
        "Only organization admins or super admins can manage organization members.",
    });
    return;
  }

  next();
};

export const requireOrganizationManagerOrAbove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const currentUser = req.user;

  if (!currentUser) {
    res.status(401).json({
      responseStatus: 0,
      message: "Authentication is required.",
    });
    return;
  }

  if (currentUser.globalRole === "SUPER_ADMIN") {
    next();
    return;
  }

  const orgId = resolveOrganizationId(req);

  if (!orgId) {
    res.status(400).json({
      responseStatus: 0,
      message: "Organization id is required.",
    });
    return;
  }

  const membership = await prisma.orgMember.findUnique({
    where: {
      userId_orgId: {
        userId: currentUser.userId,
        orgId,
      },
    },
  });

  if (!membership || !["ADMIN", "MANAGER"].includes(membership.role)) {
    res.status(403).json({
      responseStatus: 0,
      message:
        "Only organization admins, managers, or super admins can perform this action.",
    });
    return;
  }

  next();
};
