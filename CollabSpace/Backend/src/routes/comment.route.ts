import { Router } from "express";
import * as CommentController from "../controller/comment.controller";
import { authenticate, requireOrganizationAccess } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(authenticate, requireOrganizationAccess);

router.get("/", CommentController.getCommentsByTask);
router.post("/", CommentController.createComment);
router.patch("/:commentId", CommentController.updateComment);
router.delete("/:commentId", CommentController.deleteComment);

export default router;
