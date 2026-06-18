// import { TaskStatus, TaskPriority } from "../../generated/prisma";
import { TaskStatus, TaskPriority } from "@prisma/client";
import * as TaskRepo from "../repository/task.repository";
import { CreateTaskInput, UpdateTaskInput, TaskFilter } from "../model/models";

// ─── Create ───────────────────────────────────────────────────────────────────

export const createTask = async (userId: number, data: CreateTaskInput) => {
  if (!data.title || data.title.trim() === "") {
    const err: Error & { statusCode?: number } = new Error(
      "Task title is required."
    );  
    err.statusCode = 400;
    throw err;
  }

  return TaskRepo.createTask(userId, data);
};

// ─── Get All ──────────────────────────────────────────────────────────────────

export const getAllTasks = async (userId: number, filter: TaskFilter) => {
  // Validate filter values if provided
  if (filter.status && !Object.values(TaskStatus).includes(filter.status)) {
    const err: Error & { statusCode?: number } = new Error(
      `Invalid status. Allowed: ${Object.values(TaskStatus).join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  if (
    filter.priority &&
    !Object.values(TaskPriority).includes(filter.priority)
  ) {
    const err: Error & { statusCode?: number } = new Error(
      `Invalid priority. Allowed: ${Object.values(TaskPriority).join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  return TaskRepo.getTasksByUser(userId, filter);
};

// ─── Get One ──────────────────────────────────────────────────────────────────

export const getTaskById = async (taskId: number, userId: number) => {
  const task = await TaskRepo.getTaskById(taskId, userId);

  if (!task) {
    const err: Error & { statusCode?: number } = new Error(
      "Task not found or access denied."
    );
    err.statusCode = 404;
    throw err;
  }

  return task;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateTask = async (
  taskId: number,
  userId: number,
  data: UpdateTaskInput
) => {
  const task = await TaskRepo.updateTask(taskId, userId, data);

  if (!task) {
    const err: Error & { statusCode?: number } = new Error(
      "Task not found or access denied."
    );
    err.statusCode = 404;
    throw err;
  }

  return task;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteTask = async (taskId: number, userId: number) => {
  const task = await TaskRepo.deleteTask(taskId, userId);

  if (!task) {
    const err: Error & { statusCode?: number } = new Error(
      "Task not found or access denied."
    );
    err.statusCode = 404;
    throw err;
  }

  return task;
};