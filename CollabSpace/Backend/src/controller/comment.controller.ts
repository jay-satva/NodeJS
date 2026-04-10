import { NextFunction, Request, Response } from "express";
import * as CommentService from "../service/comment.service";
import { ApiResponse } from "../types";

const getAuthenticatedUser = (req: Request) => {
  const currentUser = req.user;

  if (!currentUser) {
    const err: Error & { statusCode?: number } = new Error(
      "Authentication is required."
    );
    err.statusCode = 401;
    throw err;
  }

  return currentUser;
};

const validateTaskContext = (req: Request, res: Response): {
  orgId: string;
  projectId: string;
  taskId: string;
} | null => {
  const { orgId, projectId, taskId } = req.params;

  if (typeof orgId !== "string" || !orgId.trim()) {
    res.status(400).json({
      responseStatus: 0,
      message: "Organization id is required.",
    } as ApiResponse);
    return null;
  }

  if (typeof projectId !== "string" || !projectId.trim()) {
    res.status(400).json({
      responseStatus: 0,
      message: "Project id is required.",
    } as ApiResponse);
    return null;
  }

  if (typeof taskId !== "string" || !taskId.trim()) {
    res.status(400).json({
      responseStatus: 0,
      message: "Task id is required.",
    } as ApiResponse);
    return null;
  }

  return {
    orgId: orgId.trim(),
    projectId: projectId.trim(),
    taskId: taskId.trim(),
  };
};

export const getCommentsByTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = validateTaskContext(req, res);
    if (!context) return;

    const comments = await CommentService.getCommentsByTask(
      context.orgId,
      context.projectId,
      context.taskId,
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Comments fetched successfully.",
      result: comments,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = validateTaskContext(req, res);
    if (!context) return;

    const { message } = req.body;
    const currentUser = getAuthenticatedUser(req);

    if (typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Comment message is required.",
      } as ApiResponse);
      return;
    }

    const comment = await CommentService.createComment({
      ...context,
      userId: currentUser.userId,
      message: message.trim(),
    });

    res.status(201).json({
      responseStatus: 1,
      message: "Comment added successfully.",
      result: comment,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = validateTaskContext(req, res);
    if (!context) return;

    const { commentId } = req.params;
    const { message } = req.body;
    const currentUser = getAuthenticatedUser(req);

    if (typeof commentId !== "string" || !commentId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Comment id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Comment message is required.",
      } as ApiResponse);
      return;
    }

    const comment = await CommentService.updateComment({
      ...context,
      commentId: commentId.trim(),
      userId: currentUser.userId,
      globalRole: currentUser.globalRole,
      message: message.trim(),
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Comment updated successfully.",
      result: comment,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = validateTaskContext(req, res);
    if (!context) return;

    const { commentId } = req.params;
    const currentUser = getAuthenticatedUser(req);

    if (typeof commentId !== "string" || !commentId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Comment id is required.",
      } as ApiResponse);
      return;
    }

    const comment = await CommentService.deleteComment({
      ...context,
      commentId: commentId.trim(),
      userId: currentUser.userId,
      globalRole: currentUser.globalRole,
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Comment deleted successfully.",
      result: comment,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};
