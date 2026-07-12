import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./auditAssignment.controller.js";
import * as validation from "./auditAssignment.validation.js";

const router = express.Router();
router.use(protect);

router.get("/my-assignments", controller.getMyAssignments);

// Only Admins and Asset Managers can assign auditors
router.use(restrictTo("Admin", "Asset Manager"));
router.post("/", validateBody(validation.assignAuditorSchema), controller.assign);
router.get("/cycle/:cycleId", controller.getCycleAssignments);

export default router;
