import { Router } from "express";
import * as leaveController from "../controller/leave.controller";

const leaveRouter = Router();

leaveRouter.post("/", leaveController.createLeave);
leaveRouter.get("/", leaveController.getLeaves);
leaveRouter.get("/:id", leaveController.getLeaveById);
leaveRouter.put("/:id", leaveController.updateLeave);
leaveRouter.delete("/:id", leaveController.deleteLeave);

export default leaveRouter;
