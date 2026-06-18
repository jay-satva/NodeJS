import { Request, Response } from "express";
import * as leaveService from "../service/leave.service";
import { asyncHandler, getRouteParam, sendSuccess } from "./controller.util";

export const createLeave = asyncHandler(async (req: Request, res: Response) => {
  const leave = await leaveService.createLeave(req.body);
  sendSuccess(res, "Leave created successfully.", leave, 201);
});

export const getLeaves = asyncHandler(async (_req: Request, res: Response) => {
  const leaves = await leaveService.getLeaves();
  sendSuccess(res, "Leaves fetched successfully.", leaves);
});

export const getLeaveById = asyncHandler(async (req: Request, res: Response) => {
  const leave = await leaveService.getLeaveById(getRouteParam(req.params.id, "id"));
  sendSuccess(res, "Leave fetched successfully.", leave);
});

export const updateLeave = asyncHandler(async (req: Request, res: Response) => {
  const leave = await leaveService.updateLeave(
    getRouteParam(req.params.id, "id"),
    req.body
  );
  sendSuccess(res, "Leave updated successfully.", leave);
});

export const deleteLeave = asyncHandler(async (req: Request, res: Response) => {
  const leave = await leaveService.deleteLeave(getRouteParam(req.params.id, "id"));
  sendSuccess(res, "Leave deleted successfully.", leave);
});
