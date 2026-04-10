import { GlobalRole } from "../../generated/prisma";
import prisma from "../lib/prisma";
import {
  AssignOrganizationRoleInput,
  CreateOrganizationInput,
  RemoveFromOrganization,
} from "../model/models";

type CurrentUserContext = {
  userId: string;
  globalRole: GlobalRole;
};

const ensureOrganizationExists = async (orgId: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!organization) {
    const err: Error & { statusCode?: number } = new Error(
      "Organization not found."
    );
    err.statusCode = 404;
    throw err;
  }

  return organization;
};

export const createOrganization = async (data: CreateOrganizationInput) => {
  const name = data.name.trim();

  const existingOrganization = await prisma.organization.findUnique({
    where: { name },
  });

  if (existingOrganization) {
    const err: Error & { statusCode?: number } = new Error(
      "Organization already exists."
    );
    err.statusCode = 409;
    throw err;
  }

  return prisma.organization.create({
    data: { name },
  });
};

export const getOrganizations = async (currentUser: CurrentUserContext) => {
  const where =
    currentUser.globalRole === "SUPER_ADMIN"
      ? undefined
      : {
          members: {
            some: {
              userId: currentUser.userId,
            },
          },
        };

  return prisma.organization.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          members: true,
          projects: true,
          tags: true,
        },
      },
    },
  });
};

export const getAllUsers = async (currentUser: CurrentUserContext) => {
  return prisma.user.findMany({
    where: {
      ...(currentUser.globalRole === "SUPER_ADMIN"
        ? {
            id: {
              not: currentUser.userId,
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      globalRole: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orgMembers: true,
          createdProjects: true,
          taskAssignments: true,
        },
      },
    },
  });
};

export const getOrganizationById = async (
  orgId: string,
  currentUser: CurrentUserContext
) => {
  const organization = await prisma.organization.findFirst({
    where: {
      id: orgId,
      ...(currentUser.globalRole === "SUPER_ADMIN"
        ? {}
        : {
            members: {
              some: {
                userId: currentUser.userId,
              },
            },
          }),
    },
    include: {
      _count: {
        select: {
          members: true,
          projects: true,
          tags: true,
        },
      },
    },
  });

  if (!organization) {
    const err: Error & { statusCode?: number } = new Error(
      "Organization not found."
    );
    err.statusCode = 404;
    throw err;
  }

  return organization;
};

export const getOrganizationMembers = async (
  orgId: string,
  currentUser: CurrentUserContext
) => {
  await getOrganizationById(orgId, currentUser);

  return prisma.orgMember.findMany({
    where: { orgId },
    orderBy: {
      joinedAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          globalRole: true,
          createdAt: true,
        },
      },
    },
  });
};

export const assignUserToOrganization = async (
  data: AssignOrganizationRoleInput
) => {
  const { orgId, email, role } = data;

  const [organization, user] = await Promise.all([
    ensureOrganizationExists(orgId),
    prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        globalRole: true,
      },
    }),
  ]);

  if (!user) {
    const err: Error & { statusCode?: number } = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const membership = await prisma.orgMember.upsert({
    where: {
      userId_orgId: {
        userId: user.id,
        orgId,
      },
    },
    update: {
      role,
    },
    create: {
      orgId,
      userId: user.id,
      role,
    },
    include: {
      organization: true,
    },
  });

  return {
    organization: membership.organization,
    member: {
      userId: user.id,
      name: user.name,
      email: user.email,
      globalRole: user.globalRole,
      role: membership.role,
      joinedAt: membership.joinedAt,
    },
  };
};

export const removeUserFromOrganization = async (
  data: RemoveFromOrganization
) => {
  const { orgId, userId } = data;

  await ensureOrganizationExists(orgId);

  const membership = await prisma.orgMember.findUnique({
    where: {
      userId_orgId: {
        userId,
        orgId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          globalRole: true,
        },
      },
      organization: true,
    },
  });

  if (!membership) {
    const err: Error & { statusCode?: number } = new Error(
      "Organization member not found."
    );
    err.statusCode = 404;
    throw err;
  }

  await prisma.orgMember.delete({
    where: {
      userId_orgId: {
        userId,
        orgId,
      },
    },
  });

  return {
    organization: membership.organization,
    removedMember: {
      userId: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      globalRole: membership.user.globalRole,
      role: membership.role,
      joinedAt: membership.joinedAt,
    },
  };
};
