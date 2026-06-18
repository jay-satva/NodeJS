import prisma from "../lib/prisma";
import { CreateClientInput, UpdateClientInput } from "../models/model";

const clientInclude = {
  projects: {
    include: {
      employees: true,
    },
  },
  _count: {
    select: {
      projects: true,
    },
  },
};

export const createClient = async (data: CreateClientInput) => {
  return prisma.client.create({
    data,
    include: clientInclude,
  });
};

export const findClients = async () => {
  return prisma.client.findMany({
    include: clientInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findClientById = async (clientId: string) => {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: clientInclude,
  });
};

export const updateClient = async (
  clientId: string,
  data: UpdateClientInput
) => {
  return prisma.client.update({
    where: { id: clientId },
    data,
    include: clientInclude,
  });
};

export const deleteClient = async (clientId: string) => {
  return prisma.client.delete({
    where: { id: clientId },
    include: clientInclude,
  });
};
