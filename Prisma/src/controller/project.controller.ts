import { Request, Response } from "express";
import * as projectService from "../service/project.service";
import { asyncHandler, getRouteParam, sendSuccess } from "./controller.util";

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.body);
  sendSuccess(res, "Project created successfully.", project, 201);
});

export const getProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await projectService.getProjects();
  sendSuccess(res, "Projects fetched successfully.", projects);
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(
    getRouteParam(req.params.id, "id")
  );
  sendSuccess(res, "Project fetched successfully.", project);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(
    getRouteParam(req.params.id, "id"),
    req.body
  );
  sendSuccess(res, "Project updated successfully.", project);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.deleteProject(
    getRouteParam(req.params.id, "id")
  );
  sendSuccess(res, "Project deleted successfully.", project);
});
