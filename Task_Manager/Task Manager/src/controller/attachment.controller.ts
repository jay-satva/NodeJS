import { Request, Response, NextFunction } from "express";
import * as AttachmentService from "../service/attachment.service";
import { ApiResponse } from "../types";

// ─── POST /api/tasks/:id/attachments ─────────────────────────────────────────

export const addAttachment = async (
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

    const { url, fileName, size } = req.body;

    if (!url || !fileName || !size) {
      res.status(400).json({
        responseStatus: 0,
        message: "url, fileName, and size are required.",
      } as ApiResponse);
      return;
    }

    const attachment = await AttachmentService.addAttachment(taskId, userId, {
      url,
      fileName,
      size: Number(size),
    });

    res.status(201).json({
      responseStatus: 1,
      message: "Attachment added successfully.",
      result: attachment,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tasks/:id/attachments ──────────────────────────────────────────

export const getAttachments = async (
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

    const attachments = await AttachmentService.getAttachments(taskId, userId);

    res.status(200).json({
      responseStatus: 1,
      message: "Attachments retrieved successfully.",
      result: attachments,
      totalRecord: attachments.length,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/tasks/:id/attachments/:attachmentId ─────────────────────────

export const deleteAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId       = req.user!.userId;
    const taskId       = parseInt(req.params.id, 10);
    const attachmentId = parseInt(req.params.attachmentId, 10);

    if (isNaN(taskId) || isNaN(attachmentId)) {
      res.status(400).json({
        responseStatus: 0,
        message: "Invalid task ID or attachment ID.",
      } as ApiResponse);
      return;
    }

    await AttachmentService.deleteAttachment(attachmentId, taskId, userId);

    res.status(200).json({
      responseStatus: 1,
      message: "Attachment deleted successfully.",
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};