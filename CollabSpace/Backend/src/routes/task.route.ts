import { Router } from "express";
import * as TaskController from "../controller/task.controller";
import {
  authenticate,
  requireOrganizationAccess,
  requireOrganizationManagerOrAbove,
} from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(authenticate, requireOrganizationAccess);

router.get("/", TaskController.getTasksByProject);
router.get("/board", TaskController.getProjectBoard);
router.get("/:taskId", TaskController.getTaskById);
router.get("/:taskId/activity-logs", TaskController.getTaskActivityLogs);
router.get(
  "/:taskId/assignment-history",
  TaskController.getTaskAssignmentHistory
);
router.post("/", requireOrganizationManagerOrAbove, TaskController.createTask);
router.put(
  "/:taskId",
  requireOrganizationManagerOrAbove,
  TaskController.updateTask
);
router.patch(
  "/:taskId",
  requireOrganizationManagerOrAbove,
  TaskController.updateTask
);
router.patch("/:taskId/status", TaskController.updateTaskStatus);
router.delete(
  "/:taskId",
  requireOrganizationManagerOrAbove,
  TaskController.deleteTask
);

export default router;
