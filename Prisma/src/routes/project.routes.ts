import { Router } from "express";
import * as projectController from "../controller/project.controller";

const projectRouter = Router();

projectRouter.post("/", projectController.createProject);
projectRouter.get("/", projectController.getProjects);
projectRouter.get("/:id", projectController.getProjectById);
projectRouter.put("/:id", projectController.updateProject);
projectRouter.delete("/:id", projectController.deleteProject);

export default projectRouter;
