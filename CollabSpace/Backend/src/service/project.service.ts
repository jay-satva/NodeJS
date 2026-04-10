import { GlobalRole } from "../../generated/prisma";
import prisma from "../lib/prisma";
import {
  CreateProjectInput,
  DeleteProjectInput,
  UpdateProjectInput,
} from "../model/models";

type CurrentUserContext = {
  userId: string;
  globalRole: GlobalRole;
};

const ensureOrganizationAccess = async (
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

const ensureProjectAccess = async (
  orgId: string,
  projectId: string,
  currentUser: CurrentUserContext,
  includeArchived = true
) => {
  await ensureOrganizationAccess(orgId, currentUser);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      orgId,
      ...(includeArchived ? {} : { archived: false }),
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    const err: Error & { statusCode?: number } = new Error("Project not found.");
    err.statusCode = 404;
    throw err;
  }

  return project;
};

export const createProject = async (data: CreateProjectInput) => {
  const title = data.title.trim();

  const existingProject = await prisma.project.findUnique({
    where: {
      title_orgId: {
        title,
        orgId: data.orgId,
      },
    },
  });

  if (existingProject) {
    const err: Error & { statusCode?: number } = new Error(
      "Project title already exists in this organization."
    );
    err.statusCode = 409;
    throw err;
  }

  return prisma.project.create({
    data: {
      title,
      orgId: data.orgId,
      createdBy: data.createdBy,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
};

export const getProjectsByOrganization = async (
  orgId: string,
  currentUser: CurrentUserContext,
  includeArchived: boolean
) => {
  await ensureOrganizationAccess(orgId, currentUser);

  return prisma.project.findMany({
    where: {
      orgId,
      ...(includeArchived ? {} : { archived: false }),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
};

export const getProjectById = async (
  orgId: string,
  projectId: string,
  currentUser: CurrentUserContext
) => {
  return ensureProjectAccess(orgId, projectId, currentUser);
};

export const updateProject = async (data: UpdateProjectInput) => {
  const { orgId, projectId } = data;
  const title = data.title.trim();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      orgId,
    },
  });

  if (!project) {
    const err: Error & { statusCode?: number } = new Error("Project not found.");
    err.statusCode = 404;
    throw err;
  }

  if (project.title !== title) {
    const existingProject = await prisma.project.findUnique({
      where: {
        title_orgId: {
          title,
          orgId,
        },
      },
    });

    if (existingProject) {
      const err: Error & { statusCode?: number } = new Error(
        "Project title already exists in this organization."
      );
      err.statusCode = 409;
      throw err;
    }
  }

  return prisma.project.update({
    where: { id: projectId },
    data: { title },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
};

export const deleteProject = async (data: DeleteProjectInput) => {
  const { orgId, projectId } = data;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      orgId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    const err: Error & { statusCode?: number } = new Error("Project not found.");
    err.statusCode = 404;
    throw err;
  }

  if (project.archived) {
    const err: Error & { statusCode?: number } = new Error(
      "Project is already archived."
    );
    err.statusCode = 409;
    throw err;
  }

  const archivedAt = new Date();

  await prisma.$transaction([
    prisma.task.updateMany({
      where: {
        projId: projectId,
        archived: false,
      },
      data: {
        archived: true,
        archivedAt,
      },
    }),
    prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        archived: true,
        archivedAt,
      },
    }),
  ]);

  return {
    ...project,
    archived: true,
    archivedAt,
  };
};
