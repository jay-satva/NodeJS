// import { TaskStatus, TaskPriority } from "../../../generated/prisma";
import { TaskStatus, TaskPriority } from "@prisma/client";

export interface UserModel {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TaskModel {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: Date | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string; 
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface CreateAttachmentInput{
  url: string
  fileName: string
  size: number
}

export interface CommentModel {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
 
export interface CreateCommentInput {
  content: string;
}
 
export interface UpdateCommentInput {
  content: string;
}