import * as AttachmentRepo from "../repository/attachment.repository";
import * as TaskRepo from "../repository/task.repository";

const fail = (message: string, statusCode = 400) => {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  throw err;
};

export const addAttachment = async (
  taskId: number,
  userId: number,
  data: { url: string; fileName: string; size: number }
) => {
  if (!data.url || data.url.trim() === "") fail("Attachment URL is required.");
  if (!data.fileName || data.fileName.trim() === "") fail("File name is required.");
  if (!data.size || data.size <= 0) fail("File size must be a positive number.");
  
  const task = await TaskRepo.getTaskById(taskId, userId);
  if (!task) fail("Task not found or access denied.", 404);

  return AttachmentRepo.createAttachment(taskId, userId, data);
};

export const getAttachments = async (taskId: number, userId: number) => {
  const task = await TaskRepo.getTaskById(taskId, userId);
  if (!task) fail("Task not found or access denied.", 404);

  return AttachmentRepo.getAttachmentsByTask(taskId);
};

export const deleteAttachment = async (
  attachmentId: number,
  taskId: number,
  userId: number
) => {
  const attachment = await AttachmentRepo.getAttachmentById(attachmentId);

  if (!attachment || attachment.taskId !== taskId) {
    fail("Attachment not found.", 404);
  }

  const task = await TaskRepo.getTaskById(taskId, userId);
  const isUploader = attachment!.userId === userId;
  const isTaskOwner = task !== null;

  if (!isUploader && !isTaskOwner) {
    fail("You do not have permission to delete this attachment.", 403);
  }

  return AttachmentRepo.deleteAttachment(attachmentId);
};