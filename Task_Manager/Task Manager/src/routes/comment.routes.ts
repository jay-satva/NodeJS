import { Router } from "express";
import * as CommentController from "../controller/comment.controller";
import { authenticate } from "../middleware/auth.middleware";

// mergeParams: true — allows access to :id from the parent task route
const router = Router({ mergeParams: true });

router.use(authenticate);

// Nested under /api/tasks/:id/comments
router.post("/", CommentController.createComment);
router.get("/", CommentController.getComments);

// Standalone comment operations — /api/tasks/:id/comments/:commentId
router.put("/:commentId", CommentController.updateComment);
router.delete("/:commentId", CommentController.deleteComment);

export default router;