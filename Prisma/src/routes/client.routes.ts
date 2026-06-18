import { Router } from "express";
import * as clientController from "../controller/client.controller";

const clientRouter = Router();

clientRouter.post("/", clientController.createClient);
clientRouter.get("/", clientController.getClients);
clientRouter.get("/:id", clientController.getClientById);
clientRouter.put("/:id", clientController.updateClient);
clientRouter.delete("/:id", clientController.deleteClient);

export default clientRouter;
