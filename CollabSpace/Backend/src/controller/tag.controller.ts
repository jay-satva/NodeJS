import { NextFunction, Request, Response } from "express";
import * as TagService from "../service/tag.service";
import { ApiResponse } from "../types";

const getAuthenticatedUser = (req: Request) => {
  const currentUser = req.user;

  if (!currentUser) {
    const err: Error & { statusCode?: number } = new Error(
      "Authentication is required."
    );
    err.statusCode = 401;
    throw err;
  }

  return currentUser;
};

export const getTagsByOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    const tags = await TagService.getTagsByOrganization(
      orgId.trim(),
      getAuthenticatedUser(req)
    );

    res.status(200).json({
      responseStatus: 1,
      message: "Tags fetched successfully.",
      result: tags,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId } = req.params;
    const { name } = req.body;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Tag name is required.",
      } as ApiResponse);
      return;
    }

    const tag = await TagService.createTag({
      orgId: orgId.trim(),
      name: name.trim(),
    });

    res.status(201).json({
      responseStatus: 1,
      message: "Tag created successfully.",
      result: tag,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const updateTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, tagId } = req.params;
    const { name } = req.body;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof tagId !== "string" || !tagId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Tag id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Tag name is required.",
      } as ApiResponse);
      return;
    }

    const tag = await TagService.updateTag({
      orgId: orgId.trim(),
      tagId: tagId.trim(),
      name: name.trim(),
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Tag updated successfully.",
      result: tag,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orgId, tagId } = req.params;

    if (typeof orgId !== "string" || !orgId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Organization id is required.",
      } as ApiResponse);
      return;
    }

    if (typeof tagId !== "string" || !tagId.trim()) {
      res.status(400).json({
        responseStatus: 0,
        message: "Tag id is required.",
      } as ApiResponse);
      return;
    }

    const tag = await TagService.deleteTag({
      orgId: orgId.trim(),
      tagId: tagId.trim(),
    });

    res.status(200).json({
      responseStatus: 1,
      message: "Tag deleted successfully.",
      result: tag,
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
};
