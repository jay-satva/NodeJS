import { Router } from "express";
import * as TagController from "../controller/tag.controller";
import {
  authenticate,
  requireOrganizationAccess,
  requireOrganizationManagerOrAbove,
} from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(authenticate, requireOrganizationAccess);

router.get("/", TagController.getTagsByOrganization);
router.post("/", requireOrganizationManagerOrAbove, TagController.createTag);
router.patch("/:tagId", requireOrganizationManagerOrAbove, TagController.updateTag);
router.delete(
  "/:tagId",
  requireOrganizationManagerOrAbove,
  TagController.deleteTag
);

export default router;
