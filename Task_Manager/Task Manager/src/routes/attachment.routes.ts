import { RouterOptions } from "express";
import {Router} from "express"
import * as AttachmentController from "../controller/attachment.controller";
import { authenticate } from "../middleware/auth.middleware";

const options : RouterOptions={ mergeParams: true };
const router = Router(options)
router.use(authenticate);

router.post("/", AttachmentController.addAttachment);
router.get("/", AttachmentController.getAttachments);
router.delete("/:attachmentId", AttachmentController.deleteAttachment);

export default router;