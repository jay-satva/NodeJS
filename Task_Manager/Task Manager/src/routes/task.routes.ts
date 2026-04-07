import { Router } from "express";
import * as TaskController from "../controller/task.controller";
import * as TagController from "../controller/tag.controller";
import { authenticate } from "../middleware/auth.middleware";
import attachmentRoutes from "./attachment.routes";
import commentRoutes from "./comment.routes";

const router = Router();

router.use(authenticate);

router.post("/", TaskController.createTask);
router.get("/", TaskController.getAllTasks);
router.get("/:id", TaskController.getTaskById);
router.put("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

router.post("/:id/tags", TagController.assignTagsToTask);
router.delete("/:id/tags/:tagId", TagController.removeTagFromTask);

router.use("/:id/attachments", attachmentRoutes);
router.use("/:id/comments", commentRoutes);

export default router;