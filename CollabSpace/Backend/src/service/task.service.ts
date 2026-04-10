import { GlobalRole, TaskStatus } from "../../generated/prisma";
import prisma from "../lib/prisma";
import {
  CreateTaskInput,
  DeleteTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from "../model/models";

type CurrentUserContext = {
  userId: string;
  globalRole: GlobalRole;
};

const TASK_STATUS_ORDER: TaskStatus[] = [
  "BACKLOG",
  "ONGOING",
  "DEVELOPMENT_COMPLETED",
  "UNIT_TESTING",
  "QA",
  "QA_COMPLETED",
  "COMPLETED",
];

const TASK_INCLUDE = {
  assignments: {
    orderBy: {
      assignedAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  project: {
    select: {
      id: true,
      title: true,
      orgId: true,
      archived: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
} as const;

const formatTask = <
  T extends {
    tags: Array<{ tag: unknown }>;
    assignments: Array<{ user: { id: string; name: string; email: string } }>;
  }
>(
  task: T
) => {
  return {
    ...task,
    assignedToIds: task.assignments.map((item) => item.user.id),
    assignees: task.assignments.map((item) => item.user),
    tags: task.tags.map((item) => item.tag),
  };
};

const ensureProjectAccess = async (
  orgId: string,
  projectId: string,
  currentUser: CurrentUserContext
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      orgId,
      ...(currentUser.globalRole === "SUPER_ADMIN"
        ? {}
        : {
            org: {
              members: {
                some: {
                  userId: currentUser.userId,
                },
              },
            },
          }),
    },
    include: {
      org: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!project) {
    const err: Error & { statusCode?: number } = new Error(
      "Project not found."
    );
    err.statusCode = 404;
    throw err;
  }

  if (project.archived) {
    const err: Error & { statusCode?: number } = new Error(
      "Project is archived."
    );
    err.statusCode = 409;
    throw err;
  }

  return project;
};

const ensureTaskAccess = async (
  orgId: string,
  projectId: string,
  taskId: string,
  currentUser: CurrentUserContext
) => {
  await ensureProjectAccess(orgId, projectId, currentUser);

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projId: projectId,
    },
    include: TASK_INCLUDE,
  });

  if (!task) {
    const err: Error & { statusCode?: number } = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }

  return task;
};

const ensureUsersAreOrganizationMembers = async (
  orgId: string,
  userIds: string[]
) => {
  if (userIds.length === 0) {
    return [];
  }

  const uniqueUserIds = [...new Set(userIds)];

  const memberships = await prisma.orgMember.findMany({
    where: {
      orgId,
      userId: {
        in: uniqueUserIds,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (memberships.length !== uniqueUserIds.length) {
    const err: Error & { statusCode?: number } = new Error(
      "Assigned users must belong to the organization."
    );
    err.statusCode = 400;
    throw err;
  }

  return memberships.map((membership) => membership.user);
};

const ensureTagsBelongToOrganization = async (
  orgId: string,
  tagIds: string[]
) => {
  if (tagIds.length === 0) {
    return [];
  }

  const uniqueTagIds = [...new Set(tagIds)];

  const tags = await prisma.tag.findMany({
    where: {
      id: {
        in: uniqueTagIds,
      },
      orgId,
    },
  });

  if (tags.length !== uniqueTagIds.length) {
    const err: Error & { statusCode?: number } = new Error(
      "All tags must belong to the same organization."
    );
    err.statusCode = 400;
    throw err;
  }

  return uniqueTagIds;
};

const validateStatusTransition = (
  currentStatus: TaskStatus,
  nextStatus: TaskStatus
) => {
  const currentIndex = TASK_STATUS_ORDER.indexOf(currentStatus);
  const nextIndex = TASK_STATUS_ORDER.indexOf(nextStatus);

  if (currentIndex === -1 || nextIndex === -1) {
    const err: Error & { statusCode?: number } = new Error(
      "Invalid task status."
    );
    err.statusCode = 400;
    throw err;
  }

  if (nextIndex !== currentIndex + 1) {
    const err: Error & { statusCode?: number } = new Error(
      `Task status must move strictly from ${currentStatus} to ${TASK_STATUS_ORDER[currentIndex + 1] ?? currentStatus}.`
    );
    err.statusCode = 400;
    throw err;
  }
};

export const getTasksByProject = async (
  orgId: string,
  projectId: string,
  currentUser: CurrentUserContext,
  includeArchived: boolean
) => {
  await ensureProjectAccess(orgId, projectId, currentUser);

  const tasks = await prisma.task.findMany({
    where: {
      projId: projectId,
      ...(includeArchived ? {} : { archived: false }),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: TASK_INCLUDE,
  });

  return tasks.map(formatTask);
};

export const getTaskById = async (
  orgId: string,
  projectId: string,
  taskId: string,
  currentUser: CurrentUserContext
) => {
  const task = await ensureTaskAccess(orgId, projectId, taskId, currentUser);
  return formatTask(task);
};

export const getProjectBoard = async (
  orgId: string,
  projectId: string,
  currentUser: CurrentUserContext
) => {
  await ensureProjectAccess(orgId, projectId, currentUser);

  const tasks = await prisma.task.findMany({
    where: {
      projId: projectId,
      archived: false,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: TASK_INCLUDE,
  });

  const groupedTasks = TASK_STATUS_ORDER.reduce<Record<TaskStatus, unknown[]>>(
    (acc, status) => {
      acc[status] = [];
      return acc;
    },
    {} as Record<TaskStatus, unknown[]>
  );

  tasks.forEach((task) => {
    groupedTasks[task.status].push(formatTask(task));
  });

  return groupedTasks;
};

export const createTask = async (data: CreateTaskInput) => {
  const { orgId, projectId, title, description, assignedToIds, tagIds, performedBy } =
    data;

  await ensureProjectAccess(orgId, projectId, {
    userId: performedBy,
    globalRole: "SUPER_ADMIN",
  });

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  const existingTask = await prisma.task.findUnique({
    where: {
      title_projId: {
        title: trimmedTitle,
        projId: projectId,
      },
    },
  });

  if (existingTask) {
    const err: Error & { statusCode?: number } = new Error(
      "Task title already exists in this project."
    );
    err.statusCode = 409;
    throw err;
  }

  const normalizedAssignedToIds = [...new Set(assignedToIds ?? [])];
  await ensureUsersAreOrganizationMembers(orgId, normalizedAssignedToIds);

  const normalizedTagIds = await ensureTagsBelongToOrganization(
    orgId,
    tagIds ?? []
  );

  const task = await prisma.$transaction(async (tx) => {
    const createdTask = await tx.task.create({
      data: {
        title: trimmedTitle,
        description: trimmedDescription,
        projId: projectId,
        ...(normalizedAssignedToIds.length > 0
          ? {
              assignments: {
                create: normalizedAssignedToIds.map((userId) => ({
                  userId,
                })),
              },
            }
          : {}),
        ...(normalizedTagIds.length > 0
          ? {
              tags: {
                create: normalizedTagIds.map((tagId) => ({
                  tagId,
                })),
              },
            }
          : {}),
      },
      include: TASK_INCLUDE,
    });

    if (normalizedAssignedToIds.length > 0) {
      await tx.assignmentHistory.createMany({
        data: normalizedAssignedToIds.map((userId) => ({
          taskId: createdTask.id,
          previousUserId: null,
          newUserId: userId,
        })),
      });
    }

    return createdTask;
  });

  return formatTask(task);
};

export const updateTask = async (data: UpdateTaskInput) => {
  const {
    orgId,
    projectId,
    taskId,
    title,
    description,
    assignedToIds,
    tagIds,
  } = data;

  await ensureProjectAccess(orgId, projectId, {
    userId: data.performedBy,
    globalRole: "SUPER_ADMIN",
  });

  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      projId: projectId,
    },
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      tags: true,
    },
  });

  if (!existingTask) {
    const err: Error & { statusCode?: number } = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }

  if (existingTask.archived) {
    const err: Error & { statusCode?: number } = new Error("Task is archived.");
    err.statusCode = 409;
    throw err;
  }

  const nextTitle = typeof title === "string" ? title.trim() : existingTask.title;
  const nextDescription =
    typeof description === "string"
      ? description.trim()
      : existingTask.description;

  if (nextTitle !== existingTask.title) {
    const duplicateTask = await prisma.task.findUnique({
      where: {
        title_projId: {
          title: nextTitle,
          projId: projectId,
        },
      },
    });

    if (duplicateTask) {
      const err: Error & { statusCode?: number } = new Error(
        "Task title already exists in this project."
      );
      err.statusCode = 409;
      throw err;
    }
  }

  let nextAssignedToIds = existingTask.assignments.map((assignment) => assignment.userId);
  if (assignedToIds !== undefined) {
    nextAssignedToIds = [...new Set(assignedToIds)];
  }

  await ensureUsersAreOrganizationMembers(orgId, nextAssignedToIds);

  const normalizedTagIds =
    tagIds !== undefined
      ? await ensureTagsBelongToOrganization(orgId, tagIds)
      : undefined;

  const updatedTask = await prisma.$transaction(async (tx) => {
    const previousAssignedToIds = existingTask.assignments.map((assignment) => assignment.userId);
    const removedUserIds = previousAssignedToIds.filter(
      (userId) => !nextAssignedToIds.includes(userId)
    );
    const addedUserIds = nextAssignedToIds.filter(
      (userId) => !previousAssignedToIds.includes(userId)
    );

    if (removedUserIds.length > 0) {
      await tx.assignmentHistory.createMany({
        data: removedUserIds.map((userId) => ({
          taskId,
          previousUserId: userId,
          newUserId: null,
        })),
      });
    }

    if (addedUserIds.length > 0) {
      await tx.assignmentHistory.createMany({
        data: addedUserIds.map((userId) => ({
          taskId,
          previousUserId: null,
          newUserId: userId,
        })),
      });
    }

    if (assignedToIds !== undefined) {
      await tx.taskAssignment.deleteMany({
        where: {
          taskId,
        },
      });

      if (nextAssignedToIds.length > 0) {
        await tx.taskAssignment.createMany({
          data: nextAssignedToIds.map((userId) => ({
            taskId,
            userId,
          })),
        });
      }
    }

    if (normalizedTagIds !== undefined) {
      await tx.taskTag.deleteMany({
        where: {
          taskId,
        },
      });

      if (normalizedTagIds.length > 0) {
        await tx.taskTag.createMany({
          data: normalizedTagIds.map((tagId) => ({
            taskId,
            tagId,
          })),
        });
      }
    }

    return tx.task.update({
      where: { id: taskId },
      data: {
        title: nextTitle,
        description: nextDescription,
      },
      include: TASK_INCLUDE,
    });
  });

  return formatTask(updatedTask);
};

export const updateTaskStatus = async (data: UpdateTaskStatusInput) => {
  const { orgId, projectId, taskId, status, performedBy } = data;

  const task = await ensureTaskAccess(orgId, projectId, taskId, {
    userId: performedBy,
    globalRole: "SUPER_ADMIN",
  });

  if (task.archived) {
    const err: Error & { statusCode?: number } = new Error("Task is archived.");
    err.statusCode = 409;
    throw err;
  }

  if (task.status === status) {
    const err: Error & { statusCode?: number } = new Error(
      "Task is already in the requested status."
    );
    err.statusCode = 409;
    throw err;
  }

  validateStatusTransition(task.status, status);

  const updatedTask = await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        taskId,
        userId: performedBy,
        oldStatus: task.status,
        newStatus: status,
      },
    });

    return tx.task.update({
      where: { id: taskId },
      data: {
        status,
      },
      include: TASK_INCLUDE,
    });
  });

  return formatTask(updatedTask);
};

export const deleteTask = async (data: DeleteTaskInput) => {
  const { orgId, projectId, taskId } = data;

  await ensureProjectAccess(orgId, projectId, {
    userId: "SYSTEM",
    globalRole: "SUPER_ADMIN",
  });

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projId: projectId,
    },
    include: TASK_INCLUDE,
  });

  if (!task) {
    const err: Error & { statusCode?: number } = new Error("Task not found.");
    err.statusCode = 404;
    throw err;
  }

  if (task.archived) {
    const err: Error & { statusCode?: number } = new Error(
      "Task is already archived."
    );
    err.statusCode = 409;
    throw err;
  }

  const archivedAt = new Date();

  const archivedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      archived: true,
      archivedAt,
    },
    include: TASK_INCLUDE,
  });

  return formatTask(archivedTask);
};

export const canUserUpdateTaskStatus = async (
  orgId: string,
  projectId: string,
  taskId: string,
  currentUser: CurrentUserContext
) => {
  try {
    await ensureProjectAccess(orgId, projectId, currentUser);
  } catch {
    return false;
  }

  if (currentUser.globalRole === "SUPER_ADMIN") {
    return true;
  }

  const membership = await prisma.orgMember.findUnique({
    where: {
      userId_orgId: {
        userId: currentUser.userId,
        orgId,
      },
    },
  });

  if (!membership) {
    return false;
  }

  if (["ADMIN", "MANAGER"].includes(membership.role)) {
    return true;
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projId: projectId,
      assignments: {
        some: {
          userId: currentUser.userId,
        },
      },
      archived: false,
    },
    select: {
      id: true,
    },
  });

  return Boolean(task);
};

export const getTaskActivityLogs = async (
  orgId: string,
  projectId: string,
  taskId: string,
  currentUser: CurrentUserContext
) => {
  await ensureTaskAccess(orgId, projectId, taskId, currentUser);

  return prisma.activityLog.findMany({
    where: {
      taskId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getTaskAssignmentHistory = async (
  orgId: string,
  projectId: string,
  taskId: string,
  currentUser: CurrentUserContext
) => {
  await ensureTaskAccess(orgId, projectId, taskId, currentUser);

  return prisma.assignmentHistory.findMany({
    where: {
      taskId,
    },
    orderBy: {
      timeOfChange: "desc",
    },
    include: {
      previousUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      newUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};
