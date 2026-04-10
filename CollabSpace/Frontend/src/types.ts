export type AuthMode = "login" | "signup";
export type ThemeMode = "light" | "dark";
export type OrganizationRole = "ADMIN" | "MANAGER" | "MEMBER";
export type TaskStatus =
  | "BACKLOG"
  | "ONGOING"
  | "DEVELOPMENT_COMPLETED"
  | "UNIT_TESTING"
  | "QA"
  | "QA_COMPLETED"
  | "COMPLETED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  globalRole?: string;
}

export interface StoredAuth {
  token: string;
  user: AuthUser;
}

export interface ApiResponse<T> {
  responseStatus: 0 | 1;
  message: string;
  result?: T;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export interface RegisterResult {
  id: string;
  name: string;
  email: string;
  globalRole?: string;
  createdAt: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    members: number;
    projects: number;
    tags: number;
  };
}

export interface OrganizationMember {
  userId: string;
  orgId?: string;
  role: OrganizationRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    globalRole?: string;
    createdAt?: string;
  };
}

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  globalRole?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    orgMembers: number;
    createdProjects: number;
    taskAssignments: number;
  };
}

export interface ProjectSummary {
  id: string;
  title: string;
  archived: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    tasks: number;
  };
}

export interface TagSummary {
  id: string;
  name: string;
  orgId?: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  archived: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedToIds: string[];
  assignees: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  project: {
    id: string;
    title: string;
    orgId: string;
    archived: boolean;
  };
  tags: TagSummary[];
}

export type TaskBoard = Record<TaskStatus, TaskSummary[]>;

export interface AssignmentHistoryItem {
  id: string;
  timeOfChange: string;
  taskId: string;
  previousUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  newUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CommentItem {
  id: string;
  message: string;
  createdAt: string;
  userId?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
