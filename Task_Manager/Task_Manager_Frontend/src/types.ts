export type TaskStatus = "To_Do" | "In_Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Tag {
  id: number,
  name: string
}

export interface TaskTag {
  taskId: number;
  tagId: number;
  tag: Tag;
}
 
export interface Attachment {
  id: number;
  url: string;
  fileName: string;
  size: number;
  taskId: number;
  userId: number;
  user?: { id: number; name: string; email: string };
}
 
export interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string; email: string };
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;

  tag?: TaskTag[]
  attachments?: Attachment[]
  comments?: Comment[]
  _count?: { attachments: number; comments: number }
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface ApiResponse<T = unknown> {
  responseStatus: 0 | 1;
  message: string;
  result?: T;
  totalRecord?: number;
}

export interface LoginResult {
  token: string;
  user: { id: number; name: string; email: string };
}