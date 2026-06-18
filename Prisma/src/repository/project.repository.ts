import prisma from "../lib/prisma";
import { CreateProjectInput, UpdateProjectInput } from "../models/model";

const projectInclude = {
  client: true,
  employees: true,
  _count: {
    select: {
      employees: true,
    },
  },
};

export const createProject = async (data: CreateProjectInput) => {
  const { employeeIds = [], ...projectData } = data;

  return prisma.project.create({
    data: {
      ...projectData,
      employees: employeeIds.length
        ? {
            connect: employeeIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: projectInclude,
  });
};

export const findProjects = async () => {
  return prisma.project.findMany({
    include: projectInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findProjectById = async (projectId: string) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });
};

export const updateProject = async (
  projectId: string,
  data: UpdateProjectInput
) => {
  const { employeeIds, ...projectData } = data;

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...projectData,
      ...(employeeIds !== undefined
        ? {
            employees: {
              set: employeeIds.map((id) => ({ id })),
            },
          }
        : {}),
    },
    include: projectInclude,
  });
};

export const deleteProject = async (projectId: string) => {
  return prisma.project.delete({
    where: { id: projectId },
    include: projectInclude,
  });
};
