import prisma from "../lib/prisma";
import { CreateLeaveInput, UpdateLeaveInput } from "../models/model";

const leaveInclude = {
  employee: true,
};

export const createLeave = async (data: CreateLeaveInput) => {
  return prisma.leave.create({
    data,
    include: leaveInclude,
  });
};

export const findLeaves = async () => {
  return prisma.leave.findMany({
    include: leaveInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findLeaveById = async (leaveId: string) => {
  return prisma.leave.findUnique({
    where: { id: leaveId },
    include: leaveInclude,
  });
};

export const updateLeave = async (leaveId: string, data: UpdateLeaveInput) => {
  return prisma.leave.update({
    where: { id: leaveId },
    data,
    include: leaveInclude,
  });
};

export const deleteLeave = async (leaveId: string) => {
  return prisma.leave.delete({
    where: { id: leaveId },
    include: leaveInclude,
  });
};
