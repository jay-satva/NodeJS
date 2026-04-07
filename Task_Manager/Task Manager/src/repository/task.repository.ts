import prisma from "../prisma.config";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { CreateTaskInput, UpdateTaskInput } from "../model/models";

export const createTask = async (userId: number, data: CreateTaskInput) => {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? TaskStatus.To_Do,
      priority: data.priority ?? TaskPriority.Medium,
      due_date: data.due_date ? new Date(data.due_date) : null,
      userId,
    },
  });
};

export const getTasksByUser = async (
  userId: number,
  filter: { status?: TaskStatus; priority?: TaskPriority }
) => {
  return prisma.task.findMany({
    where: {
      userId,
      ...(filter.status && { status: filter.status }),
      ...(filter.priority && { priority: filter.priority }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      tags: {
        include: { tag: true },
      },
      _count: {
        select: { attachments: true, comments: true },
      },
    },
  });
};

export const getTaskById = async (taskId: number, userId: number) => {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    include: {
      tags: {
        include: { tag: true },
      },
      attachments: true,
      comments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { attachments: true, comments: true },
      },
    },
  });
};

export const updateTask = async (
  taskId: number,
  userId: number,
  data: UpdateTaskInput
) => {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) return null;

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.due_date !== undefined && { due_date: new Date(data.due_date) }),
    },
  });
};

export const deleteTask = async (taskId: number, userId: number) => {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!existing) return null;

  return prisma.task.delete({ where: { id: taskId } });
};