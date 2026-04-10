import { Router } from "express";
import * as OrganizationController from "../controller/organization.controller";
import {
  authenticate,
  requireOrganizationAccess,
  requireOrganizationAdminOrSuperAdmin,
  requireSuperAdmin,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/users", requireSuperAdmin, OrganizationController.getAllUsers);
router.get("/", OrganizationController.getOrganizations);
router.post("/", requireSuperAdmin, OrganizationController.createOrganization);
router.get(
  "/:orgId",
  requireOrganizationAccess,
  OrganizationController.getOrganizationById
);
router.get(
  "/:orgId/members",
  requireOrganizationAccess,
  OrganizationController.getOrganizationMembers
);
router.post(
  "/:orgId/members",
  requireOrganizationAdminOrSuperAdmin,
  OrganizationController.assignUserToOrganization
);
router.delete(
  "/:orgId/members/:userId",
  requireOrganizationAdminOrSuperAdmin,
  OrganizationController.removeUserFromOrganization
);

export default router;
