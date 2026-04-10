import { GlobalRole } from "../../generated/prisma";
import prisma from "../lib/prisma";
import {
  CreateCommentInput,
  DeleteCommentInput,
  UpdateCommentInput,
} from "../model/models";

type CurrentUserContext = {
  userId: string;
  globalRole: GlobalRole;
};

const ensureTaskAccess = async (
  orgId: string,
  projectId: string,
  taskId: string,
  currentUser: CurrentUserContext
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projId: projectId,
      project: {
        orgId,
        archived: false,
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
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          orgId: true,
        },
      },
    },
  });

  if (!task) {
    const err: Error & { statusCode?: number } = new Error(
      "Task not found."
    );
    err.statusCode = 404;
    throw err;
  }

  if (task.archived) {
    const err: Error & { statusCode?: number } = new Error("Task is archived.");
    err.statusCode = 409;
    throw err;
  }

  return task;
};

const getMembership = async (orgId: string, userId: string) => {
  return prisma.orgMember.findUnique({
    where: {
      userId_orgId: {
        userId,
        orgId,
      },
    },
  });
};

export const getCommentsByTask = async (
  orgId: string,
  projectId: string,
  taskId: string,
  currentUser: CurrentUserContext
) => {
  await ensureTaskAccess(orgId, projectId, taskId, currentUser);

  return prisma.comment.findMany({
    where: {
      taskId,
    },
    orderBy: {
      createdAt: "asc",
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

export const createComment = async (data: CreateCommentInput) => {
  await ensureTaskAccess(data.orgId, data.projectId, data.taskId, {
    userId: data.userId,
    globalRole: "SUPER_ADMIN",
  });

  return prisma.comment.create({
    data: {
      taskId: data.taskId,
      userId: data.userId,
      message: data.message.trim(),
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

export const updateComment = async (data: UpdateCommentInput) => {
  await ensureTaskAccess(data.orgId, data.projectId, data.taskId, {
    userId: data.userId,
    globalRole: data.globalRole,
  });

  const comment = await prisma.comment.findFirst({
    where: {
      id: data.commentId,
      taskId: data.taskId,
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

  if (!comment) {
    const err: Error & { statusCode?: number } = new Error("Comment not found.");
    err.statusCode = 404;
    throw err;
  }

  if (data.globalRole !== "SUPER_ADMIN" && comment.userId !== data.userId) {
    const membership = await getMembership(data.orgId, data.userId);
    if (!membership || !["ADMIN", "MANAGER"].includes(membership.role)) {
      const err: Error & { statusCode?: number } = new Error(
        "You are not allowed to update this comment."
      );
      err.statusCode = 403;
      throw err;
    }
  }

  return prisma.comment.update({
    where: {
      id: data.commentId,
    },
    data: {
      message: data.message.trim(),
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

export const deleteComment = async (data: DeleteCommentInput) => {
  await ensureTaskAccess(data.orgId, data.projectId, data.taskId, {
    userId: data.userId,
    globalRole: data.globalRole,
  });

  const comment = await prisma.comment.findFirst({
    where: {
      id: data.commentId,
      taskId: data.taskId,
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

  if (!comment) {
    const err: Error & { statusCode?: number } = new Error("Comment not found.");
    err.statusCode = 404;
    throw err;
  }

  if (data.globalRole !== "SUPER_ADMIN" && comment.userId !== data.userId) {
    const membership = await getMembership(data.orgId, data.userId);
    if (!membership || !["ADMIN", "MANAGER"].includes(membership.role)) {
      const err: Error & { statusCode?: number } = new Error(
        "You are not allowed to delete this comment."
      );
      err.statusCode = 403;
      throw err;
    }
  }

  await prisma.comment.delete({
    where: {
      id: data.commentId,
    },
  });

  return comment;
};
