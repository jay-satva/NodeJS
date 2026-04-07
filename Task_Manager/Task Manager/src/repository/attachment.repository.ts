import prisma from "../prisma.config";
import { CreateAttachmentInput } from "../model/models";

export const createAttachment = async (
  taskId: number,
  userId: number,
  data: CreateAttachmentInput
) => {
  return prisma.attachment.create({
    data: {
      url: data.url,
      fileName: data.fileName,
      size: data.size,
      taskId,
      userId,
    },
  });
};

// ─── Get All Attachments For Task ─────────────────────────────────────────────

export const getAttachmentsByTask = async (taskId: number) => {
  return prisma.attachment.findMany({
    where: { taskId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { id: "desc" },
  });
};

// ─── Get Attachment By ID ─────────────────────────────────────────────────────

export const getAttachmentById = async (attachmentId: number) => {
  return prisma.attachment.findUnique({
    where: { id: attachmentId },
  });
};

// ─── Delete Attachment ────────────────────────────────────────────────────────

export const deleteAttachment = async (attachmentId: number) => {
  return prisma.attachment.delete({
    where: { id: attachmentId },
  });
};