import { Router } from "express";
import * as ProjectController from "../controller/project.controller";
import {
  authenticate,
  requireOrganizationAccess,
  requireOrganizationManagerOrAbove,
} from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", requireOrganizationAccess, ProjectController.getProjectsByOrganization);
router.get(
  "/:projectId",
  requireOrganizationAccess,
  ProjectController.getProjectById
);
router.post(
  "/",
  requireOrganizationManagerOrAbove,
  ProjectController.createProject
);
router.patch(
  "/:projectId",
  requireOrganizationManagerOrAbove,
  ProjectController.updateProject
);
router.delete(
  "/:projectId",
  requireOrganizationManagerOrAbove,
  ProjectController.deleteProject
);

export default router;
