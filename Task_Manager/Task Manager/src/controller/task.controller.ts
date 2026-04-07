import { Request, Response, NextFunction } from "express";
import * as TaskService from "../service/task.service";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { ApiResponse } from "../types";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, description, status, priority, due_date } = req.body;

    const task = await TaskService.createTask(userId, {
      title,
      description,
      status,
      priority,
      due_date,
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

// ─── GET /api/tasks ───────────────────────────────────────────────────────────

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // One filter at a time as per requirements
    const status = req.query.status as TaskStatus | undefined;
    const priority = req.query.priority as TaskPriority | undefined;

    const tasks = await TaskService.getAllTasks(userId, { status, priority });

    res.status(200).json({
      responseStatus: 1,
      message: "Task list retrieved successfully.",
      result: tasks,
      totalRecord: tasks.length,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      res.status(400).json({
        responseStatus: 0,
        message: "Invalid task ID.",
      } as ApiResponse);
      return;
    }

    const task = await TaskService.getTaskById(taskId, userId);

    res.status(200).json({
      responseStatus: 1,
      message: "Task retrieved successfully.",
      result: task,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      res.status(400).json({
        responseStatus: 0,
        message: "Invalid task ID.",
      } as ApiResponse);
      return;
    }

    const { title, description, status, priority, due_date } = req.body;

    const task = await TaskService.updateTask(taskId, userId, {
      title,
      description,
      status,
      priority,
      due_date,
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

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      res.status(400).json({
        responseStatus: 0,
        message: "Invalid task ID.",
      } as ApiResponse);
      return;
    }

    await TaskService.deleteTask(taskId, userId);

    res.status(200).json({
      responseStatus: 1,
      message: "Task deleted successfully.",
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};