import { Request, Response, NextFunction } from "express";
import * as CommentService from "../service/comment.service";
import { ApiResponse } from "../types";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      res.status(400).json({ responseStatus: 0, message: "Invalid task ID." } as ApiResponse);
      return;
    }

    const { content } = req.body;
    if (!content) {
      res.status(400).json({ responseStatus: 0, message: "Comment content is required." } as ApiResponse);
      return;
    }

    const comment = await CommentService.createComment(taskId, userId, content);
    res.status(201).json({
      responseStatus: 1,
      message: "Comment added successfully.",
      result: comment,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      res.status(400).json({ responseStatus: 0, message: "Invalid task ID." } as ApiResponse);
      return;
    }

    const comments = await CommentService.getComments(taskId, userId);
    res.status(200).json({
      responseStatus: 1,
      message: "Comments retrieved successfully.",
      result: comments,
      totalRecord: comments.length,
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
    const userId    = req.user!.userId;
    const commentId = parseInt(req.params.commentId, 10);

    if (isNaN(commentId)) {
      res.status(400).json({ responseStatus: 0, message: "Invalid comment ID." } as ApiResponse);
      return;
    }

    const { content } = req.body;
    if (!content) {
      res.status(400).json({ responseStatus: 0, message: "Comment content is required." } as ApiResponse);
      return;
    }

    const comment = await CommentService.updateComment(commentId, userId, content);
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
    const userId    = req.user!.userId;
    const commentId = parseInt(req.params.commentId, 10);

    if (isNaN(commentId)) {
      res.status(400).json({ responseStatus: 0, message: "Invalid comment ID." } as ApiResponse);
      return;
    }
    await CommentService.deleteComment(commentId, userId);

    res.status(200).json({
      responseStatus: 1,
      message: "Comment deleted successfully.",
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};