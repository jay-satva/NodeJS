import { NextFunction, Request, Response } from "express";
import { TaskStatus } from "../../generated/prisma";
import * as TaskService from "../service/task.service";
import { ApiResponse } from "../types";

const TASK_STATUSES = new Set<string>(Object.values(TaskStatus));

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

const normalizeTagIds = (tagIds: unknown): string[] | null => {
  if (tagIds === undefined) {
    return [];
  }

  if (!Array.isArray(tagIds)) {
    return null;
  }

  const normalizedTagIds = tagIds
    .filter((tagId): tagId is string => typeof tagId === "string")
    .map((tagId) => tagId.trim())
    .filter((tagId) => tagId.length > 0);

  if (normalizedTagIds.length !== tagIds.filter((tagId) => typeof tagId === "string" && tagId.trim().length > 0).length) {
    return null;
  }

  if (tagIds.some((tagId) => typeof tagId !== "string")) {
    return null;
  }

  return normalizedTagIds;
};

const normalizeAssignedToIds = (assignedTo: unknown): string[] | null | undefined => {
  if (assignedTo === undefined) {
    return undefined;
  }

  if (assignedTo === null) {
    return [];
  }

  if (typeof assignedTo === "string") {
    const trimmedValue = assignedTo.trim();
    return trimmedValue ? [trimmedValue] : [];
  }

  if (!Array.isArray(assignedTo)) {
    return null;
  }

  if (assignedTo.some((value) => typeof value !== "string")) {
    return null;
  }

  return [...new Set(assignedTo.map((value) => value.trim()).filter(Boolean))];
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId } = req.params;
    const { title, description, assignedToIds, assignedTo, tagIds } = req.body;
    const currentUser = getAuthenticatedUser(req);
    const normalizedTagIds = normalizeTagIds(tagIds);
    const normalizedAssignedToIds = normalizeAssignedToIds(
      assignedToIds ?? assignedTo
    );

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Organization id is required." } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Project id is required." } as ApiResponse);
      return;
    }

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Task title is required." } as ApiResponse);
      return;
    }

    if (typeof description !== "string" || !description.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Task description is required." } as ApiResponse);
      return;
    }

    if (normalizedAssignedToIds === null) {
      res.status(400).json({
        responseStatus: 0,
        message: "assignedToIds must be a valid string or array of valid strings.",
      } as ApiResponse);
      return;
    }

    if (normalizedTagIds === null) {
      res.status(400).json({ responseStatus: 0, message: "tagIds must be an array of valid strings." } as ApiResponse);
      return;
    }

    const task = await TaskService.createTask({
      orgId: orgId.trim(),
      projectId: projectId.trim(),
      title: title.trim(),
      description: description.trim(),
      assignedToIds: normalizedAssignedToIds ?? [],
      tagIds: normalizedTagIds,
      performedBy: currentUser.userId,
    });

    res.status(201).json({
      responseStatus: 1,
      message: "Task created successfully.",
      result: task,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getTasksByProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Organization id is required." } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Project id is required." } as ApiResponse);
      return;
    }

    const tasks = await TaskService.getTasksByProject(
      orgId.trim(),
      projectId.trim(),
      getAuthenticatedUser(req),
      parseIncludeArchived(req.query.includeArchived)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Tasks fetched successfully.",
      result: tasks,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId, taskId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Organization id is required." } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Project id is required." } as ApiResponse);
      return;
    }

    if (typeof taskId !== "string" || !taskId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Task id is required." } as ApiResponse);
      return;
    }

    const task = await TaskService.getTaskById(
      orgId.trim(),
      projectId.trim(),
      taskId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Task fetched successfully.",
      result: task,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getProjectBoard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Organization id is required." } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Project id is required." } as ApiResponse);
      return;
    }

    const board = await TaskService.getProjectBoard(
      orgId.trim(),
      projectId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Project board fetched successfully.",
      result: board,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId, taskId } = req.params;
    const { title, description, assignedToIds, assignedTo, tagIds } = req.body;
    const currentUser = getAuthenticatedUser(req);
    const normalizedTagIds = normalizeTagIds(tagIds);
    const normalizedAssignedToIds = normalizeAssignedToIds(
      assignedToIds ?? assignedTo
    );

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Organization id is required." } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Project id is required." } as ApiResponse);
      return;
    }

    if (typeof taskId !== "string" || !taskId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Task id is required." } as ApiResponse);
      return;
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      res.status(400).json({ responseStatus: 0, message: "Task title must be a valid string." } as ApiResponse);
      return;
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      res.status(400).json({ responseStatus: 0, message: "Task description must be a valid string." } as ApiResponse);
      return;
    }

    if (normalizedAssignedToIds === null) {
      res.status(400).json({
        responseStatus: 0,
        message: "assignedToIds must be a valid string or array of valid strings.",
      } as ApiResponse);
      return;
    }

    if (normalizedTagIds === null) {
      res.status(400).json({ responseStatus: 0, message: "tagIds must be an array of valid strings." } as ApiResponse);
      return;
    }

    const task = await TaskService.updateTask({
      orgId: orgId.trim(),
      projectId: projectId.trim(),
      taskId: taskId.trim(),
      title: typeof title === "string" ? title.trim() : undefined,
      description:
        typeof description === "string" ? description.trim() : undefined,
      assignedToIds: normalizedAssignedToIds,
      tagIds: tagIds === undefined ? undefined : normalizedTagIds,
      performedBy: currentUser.userId,
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Task updated successfully.",
      result: task,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId, taskId } = req.params;
    const { status } = req.body;
    const currentUser = getAuthenticatedUser(req);

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Organization id is required." } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Project id is required." } as ApiResponse);
      return;
    }

    if (typeof taskId !== "string" || !taskId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Task id is required." } as ApiResponse);
      return;
    }

    if (typeof status !== "string" || !TASK_STATUSES.has(status)) {
      res.status(400).json({
        responseStatus: 0,
        message: "Status must be a valid task status.",
      } as ApiResponse);
      return;
    }

    const allowed = await TaskService.canUserUpdateTaskStatus(
      orgId.trim(),
      projectId.trim(),
      taskId.trim(),
      currentUser
    );

    if (!allowed) {
      res.status(403).json({
        responseStatus: 0,
        message:
          "Only admins, managers, super admins, or the assigned member can update task status.",
      } as ApiResponse);
      return;
    }

    const task = await TaskService.updateTaskStatus({
      orgId: orgId.trim(),
      projectId: projectId.trim(),
      taskId: taskId.trim(),
      status: status as TaskStatus,
      performedBy: currentUser.userId,
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Task status updated successfully.",
      result: task,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId, taskId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Organization id is required." } as ApiResponse);
      return;
    }

    if (typeof projectId !== "string" || !projectId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Project id is required." } as ApiResponse);
      return;
    }

    if (typeof taskId !== "string" || !taskId.trim()) {
      res.status(400).json({ responseStatus: 0, message: "Task id is required." } as ApiResponse);
      return;
    }

    const task = await TaskService.deleteTask({
      orgId: orgId.trim(),
      projectId: projectId.trim(),
      taskId: taskId.trim(),
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Task archived successfully.",
      result: task,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getTaskActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId, taskId } = req.params;

    if (
      typeof orgId !== "string" ||
      !orgId.trim() ||
      typeof projectId !== "string" ||
      !projectId.trim() ||
      typeof taskId !== "string" ||
      !taskId.trim()
    ) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id, project id, and task id are required.",
      } as ApiResponse);
      return;
    }

    const activityLogs = await TaskService.getTaskActivityLogs(
      orgId.trim(),
      projectId.trim(),
      taskId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Task activity logs fetched successfully.",
      result: activityLogs,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getTaskAssignmentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, projectId, taskId } = req.params;

    if (
      typeof orgId !== "string" ||
      !orgId.trim() ||
      typeof projectId !== "string" ||
      !projectId.trim() ||
      typeof taskId !== "string" ||
      !taskId.trim()
    ) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id, project id, and task id are required.",
      } as ApiResponse);
      return;
    }

    const assignmentHistory = await TaskService.getTaskAssignmentHistory(
      orgId.trim(),
      projectId.trim(),
      taskId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Task assignment history fetched successfully.",
      result: assignmentHistory,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};
