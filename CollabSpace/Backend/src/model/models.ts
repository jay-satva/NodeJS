import type { Role } from "../../generated/prisma";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateOrganizationInput {
  name: string;
}

export interface AssignOrganizationRoleInput {
  orgId: string;
  email: string;
  role: Role;
}

export interface RemoveFromOrganization {
  orgId: string;
  userId: string;
}

export interface CreateProjectInput {
  orgId: string;
  title: string;
  createdBy: string;
}

export interface UpdateProjectInput {
  orgId: string;
  projectId: string;
  title: string;
}

export interface DeleteProjectInput {
  orgId: string;
  projectId: string;
}

export interface CreateTaskInput {
  orgId: string;
  projectId: string;
  title: string;
  description: string;
  assignedToIds?: string[];
  tagIds?: string[];
  performedBy: string;
}

export interface UpdateTaskInput {
  orgId: string;
  projectId: string;
  taskId: string;
  title?: string;
  description?: string;
  assignedToIds?: string[];
  tagIds?: string[];
  performedBy: string;
}

export interface UpdateTaskStatusInput {
  orgId: string;
  projectId: string;
  taskId: string;
  status: import("../../generated/prisma").TaskStatus;
  performedBy: string;
}

export interface DeleteTaskInput {
  orgId: string;
  projectId: string;
  taskId: string;
}

export interface CreateTagInput {
  orgId: string;
  name: string;
}

export interface UpdateTagInput {
  orgId: string;
  tagId: string;
  name: string;
}

export interface DeleteTagInput {
  orgId: string;
  tagId: string;
}

export interface CreateCommentInput {
  orgId: string;
  projectId: string;
  taskId: string;
  userId: string;
  message: string;
}

export interface UpdateCommentInput {
  orgId: string;
  projectId: string;
  taskId: string;
  commentId: string;
  userId: string;
  globalRole: import("../../generated/prisma").GlobalRole;
  message: string;
}

export interface DeleteCommentInput {
  orgId: string;
  projectId: string;
  taskId: string;
  commentId: string;
  userId: string;
  globalRole: import("../../generated/prisma").GlobalRole;
}
