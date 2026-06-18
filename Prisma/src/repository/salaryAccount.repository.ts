import prisma from "../lib/prisma";
import {
  CreateSalaryAccountInput,
  UpdateSalaryAccountInput,
} from "../models/model";

const salaryInclude = {
  employee: true,
};

export const createSalaryAccount = async (data: CreateSalaryAccountInput) => {
  return prisma.salaryAcct.create({
    data,
    include: salaryInclude,
  });
};

export const findSalaryAccounts = async () => {
  return prisma.salaryAcct.findMany({
    include: salaryInclude,
    orderBy: {
      openedAt: "desc",
    },
  });
};

export const findSalaryAccountById = async (salaryAccountId: string) => {
  return prisma.salaryAcct.findUnique({
    where: { id: salaryAccountId },
    include: salaryInclude,
  });
};

export const updateSalaryAccount = async (
  salaryAccountId: string,
  data: UpdateSalaryAccountInput
) => {
  return prisma.salaryAcct.update({
    where: { id: salaryAccountId },
    data,
    include: salaryInclude,
  });
};

export const deleteSalaryAccount = async (salaryAccountId: string) => {
  return prisma.salaryAcct.delete({
    where: { id: salaryAccountId },
    include: salaryInclude,
  });
};
