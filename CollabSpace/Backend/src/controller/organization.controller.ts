import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma";
import * as OrganizationService from "../service/organization.service";
import { ApiResponse } from "../types";

const ORGANIZATION_ROLES = new Set<string>(Object.values(Role));

const normalizeOrganizationRole = (role: string): Role | null => {
  const normalizedRole = role.trim().toUpperCase();

  if (normalizedRole === "USER") {
    return Role.MEMBER;
  }

  if (ORGANIZATION_ROLES.has(normalizedRole)) {
    return normalizedRole as Role;
  }

  return null;
};

const getAuthenticatedUser = (req: Request) => {
  const currentUser = req.user;

  if (!currentUser) {
    const err: Error & { statusCode?: number } = new Error(
      "Authentication is required."
    );
    err.statusCode = 401;
    throw err;
  }

  return currentUser;
};

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization name is required.",
      } as ApiResponse);
      return;
    }

    const organization = await OrganizationService.createOrganization({ name });

    res.status(201).json({
      responseStatus: 1,
      message: "Organization created successfully.",
      result: organization,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizations = await OrganizationService.getOrganizations(
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Organizations fetched successfully.",
      result: organizations,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await OrganizationService.getAllUsers(getAuthenticatedUser(req));

    res.status(200).json({
      responseStatus: 1,
      message: "Users fetched successfully.",
      result: users,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getOrganizationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    const organization = await OrganizationService.getOrganizationById(
      orgId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Organization fetched successfully.",
      result: organization,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getOrganizationMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    const members = await OrganizationService.getOrganizationMembers(
      orgId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Organization members fetched successfully.",
      result: members,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const assignUserToOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { email, userId, role } = req.body;
    const resolvedEmail =
      typeof email === "string" && email.trim()
        ? email.trim()
        : typeof userId === "string" && userId.trim()
        ? userId.trim()
        : "";

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (!resolvedEmail) {
      res.status(400).json({
        responseStatus: 0,
        message: "User email is required.",
      } as ApiResponse);
      return;
    }

    if (typeof role !== "string") {
      res.status(400).json({
        responseStatus: 0,
        message: "Role is required.",
      } as ApiResponse);
      return;
    }

    const normalizedRole = normalizeOrganizationRole(role);

    if (!normalizedRole) {
      res.status(400).json({
        responseStatus: 0,
        message: "Role must be one of ADMIN, MANAGER, MEMBER, or USER.",
      } as ApiResponse);
      return;
    }

    const result = await OrganizationService.assignUserToOrganization({
      orgId: orgId.trim(),
      email: resolvedEmail,
      role: normalizedRole,
    });

    res.status(200).json({
      responseStatus: 1,
      message: "User role assigned successfully.",
      result,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const removeUserFromOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, userId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof userId !== "string" || !userId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "User id is required.",
      } as ApiResponse);
      return;
    }

    const result = await OrganizationService.removeUserFromOrganization({
      orgId: orgId.trim(),
      userId: userId.trim(),
    });

    res.status(200).json({
      responseStatus: 1,
      message: "User removed from organization successfully.",
      result,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};
