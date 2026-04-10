import { GlobalRole } from "../../generated/prisma";
import prisma from "../lib/prisma";
import { CreateTagInput, DeleteTagInput, UpdateTagInput } from "../model/models";

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

export const getTagsByOrganization = async (
  orgId: string,
  currentUser: CurrentUserContext
) => {
  await ensureOrganizationAccess(orgId, currentUser);

  return prisma.tag.findMany({
    where: { orgId },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
};

export const createTag = async (data: CreateTagInput) => {
  const name = data.name.trim();

  const existingTag = await prisma.tag.findUnique({
    where: {
      name_orgId: {
        name,
        orgId: data.orgId,
      },
    },
  });

  if (existingTag) {
    const err: Error & { statusCode?: number } = new Error(
      "Tag already exists in this organization."
    );
    err.statusCode = 409;
    throw err;
  }

  return prisma.tag.create({
    data: {
      orgId: data.orgId,
      name,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
};

export const updateTag = async (data: UpdateTagInput) => {
  const name = data.name.trim();

  const tag = await prisma.tag.findFirst({
    where: {
      id: data.tagId,
      orgId: data.orgId,
    },
  });

  if (!tag) {
    const err: Error & { statusCode?: number } = new Error("Tag not found.");
    err.statusCode = 404;
    throw err;
  }

  if (tag.name !== name) {
    const existingTag = await prisma.tag.findUnique({
      where: {
        name_orgId: {
          name,
          orgId: data.orgId,
        },
      },
    });

    if (existingTag) {
      const err: Error & { statusCode?: number } = new Error(
        "Tag already exists in this organization."
      );
      err.statusCode = 409;
      throw err;
    }
  }

  return prisma.tag.update({
    where: {
      id: data.tagId,
    },
    data: {
      name,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
};

export const deleteTag = async (data: DeleteTagInput) => {
  const tag = await prisma.tag.findFirst({
    where: {
      id: data.tagId,
      orgId: data.orgId,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!tag) {
    const err: Error & { statusCode?: number } = new Error("Tag not found.");
    err.statusCode = 404;
    throw err;
  }

  await prisma.tag.delete({
    where: {
      id: data.tagId,
    },
  });

  return tag;
};
