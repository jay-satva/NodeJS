import prisma from "../prisma.config";
import { CreateCommentInput, UpdateCommentInput } from "../model/models";
import { ReactionType } from "@prisma/client";

const reactionInclude = {
  reactions: {
    select: { type: true, userId: true },
  },
};

// ─── Create Comment ───────────────────────────────────────────────────────────

export const createComment = async (
  taskId: number,
  userId: number,
  data: CreateCommentInput
) => {
  return prisma.comment.create({
    data: { content: data.content, taskId, userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ...reactionInclude,
    },
  });
};

// ─── Get All Comments For Task ────────────────────────────────────────────────

export const getCommentsByTask = async (taskId: number) => {
  return prisma.comment.findMany({
    where: { taskId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ...reactionInclude,
    },
    orderBy: { createdAt: "desc" },
  });
};

// ─── Get Comment By ID ────────────────────────────────────────────────────────

export const getCommentById = async (commentId: number) => {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ...reactionInclude,
    },
  });
};

// ─── Update Comment ───────────────────────────────────────────────────────────

export const updateComment = async (
  commentId: number,
  data: UpdateCommentInput
) => {
  return prisma.comment.update({
    where: { id: commentId },
    data: { content: data.content },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ...reactionInclude,
    },
  });
};

// ─── Delete Comment ───────────────────────────────────────────────────────────

export const deleteComment = async (commentId: number) => {
  return prisma.comment.delete({ where: { id: commentId } });
};

// ─── Add Reaction ─────────────────────────────────────────────────────────────

export const addReaction = async (
  commentId: number,
  userId: number,
  type: ReactionType
) => {
  return prisma.commentReaction.create({
    data: { commentId, userId, type },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

// ─── Get Reaction ─────────────────────────────────────────────────────────────

export const getReaction = async (commentId: number, userId: number) => {
  return prisma.commentReaction.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });
};

// ─── Remove Reaction ──────────────────────────────────────────────────────────

export const removeReaction = async (commentId: number, userId: number) => {
  return prisma.commentReaction.delete({
    where: { userId_commentId: { userId, commentId } },
  });
};