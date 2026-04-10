import { NextFunction, Request, Response } from "express";
import * as ProjectService from "../service/project.service";
import { ApiResponse } from "../types";

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

const parseIncludeArchived = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  return value.trim().toLowerCase() === "true";
};

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { title } = req.body;
    const currentUser = getAuthenticatedUser(req);

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Project title is required.",
      } as ApiResponse);
      return;
    }

    const project = await ProjectService.createProject({
      orgId: orgId.trim(),
      title: title.trim(),
      createdBy: currentUser.userId,
    });

    res.status(201).json({
      responseStatus: 1,
      message: "Project created successfully.",
      result: project,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getProjectsByOrganization = async (
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

    const projects = await ProjectService.getProjectsByOrganization(
      orgId.trim(),
      getAuthenticatedUser(req),
      parseIncludeArchived(req.query.includeArchived)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Projects fetched successfully.",
      result: projects,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Project id is required.",
      } as ApiResponse);
      return;
    }

    const project = await ProjectService.getProjectById(
      orgId.trim(),
      projectId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Project fetched successfully.",
      result: project,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId } = req.params;
    const { title } = req.body;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Project id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Project title is required.",
      } as ApiResponse);
      return;
    }

    const project = await ProjectService.updateProject({
      orgId: orgId.trim(),
      projectId: projectId.trim(),
      title: title.trim(),
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Project updated successfully.",
      result: project,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Project id is required.",
      } as ApiResponse);
      return;
    }

    const project = await ProjectService.deleteProject({
      orgId: orgId.trim(),
      projectId: projectId.trim(),
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Project archived successfully.",
      result: project,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};
