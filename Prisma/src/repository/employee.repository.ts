import prisma from "../lib/prisma";
import { CreateEmployeeInput, UpdateEmployeeInput } from "../models/model";

const employeeInclude = {
  salaryAcct: true,
  leaves: true,
  projects: {
    include: {
      client: true,
    },
  },
  _count: {
    select: {
      leaves: true,
      projects: true,
    },
  },
};

export const createEmployee = async (data: CreateEmployeeInput) => {
  return prisma.employee.create({
    data,
    include: employeeInclude,
  });
};

export const findEmployees = async () => {
  return prisma.employee.findMany({
    include: employeeInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findEmployeeById = async (employeeId: string) => {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    include: employeeInclude,
  });
};

export const updateEmployee = async (
  employeeId: string,
  data: UpdateEmployeeInput
) => {
  return prisma.employee.update({
    where: { id: employeeId },
    data,
    include: employeeInclude,
  });
};

export const deleteEmployee = async (employeeId: string) => {
  return prisma.employee.delete({
    where: { id: employeeId },
    include: employeeInclude,
  });
};
