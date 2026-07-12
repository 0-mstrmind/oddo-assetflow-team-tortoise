import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./auditResult.controller.js";
import * as validation from "./auditResult.validation.js";

const router = express.Router();
router.use(protect);

// Auditors (and admins/managers) can mark results
router.post("/", restrictTo("admin", "manager", "auditor"), validateBody(validation.markResultSchema), controller.markResult);

// Discrepancy reports and full results
router.use(restrictTo("admin", "manager", "auditor"));
router.get("/cycle/:cycleId/discrepancies", controller.getDiscrepancies);
router.get("/cycle/:cycleId", controller.getAllResults);

export default router;
