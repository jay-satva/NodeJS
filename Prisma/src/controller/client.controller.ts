import { Request, Response } from "express";
import * as clientService from "../service/client.service";
import { asyncHandler, getRouteParam, sendSuccess } from "./controller.util";

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.createClient(req.body);
  sendSuccess(res, "Client created successfully.", client, 201);
});

export const getClients = asyncHandler(async (_req: Request, res: Response) => {
  const clients = await clientService.getClients();
  sendSuccess(res, "Clients fetched successfully.", clients);
});

export const getClientById = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.getClientById(getRouteParam(req.params.id, "id"));
  sendSuccess(res, "Client fetched successfully.", client);
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.updateClient(
    getRouteParam(req.params.id, "id"),
    req.body
  );
  sendSuccess(res, "Client updated successfully.", client);
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.deleteClient(getRouteParam(req.params.id, "id"));
  sendSuccess(res, "Client deleted successfully.", client);
});
