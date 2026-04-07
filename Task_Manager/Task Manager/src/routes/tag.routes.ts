import { Router } from "express";
import * as TagController from "../controller/tag.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.post("/", TagController.createTag);
router.get("/", TagController.getAllTags);

router.get("/:tagId/tasks", TagController.getTasksByTag);

export default router;