import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./auditCycle.controller.js";
import * as validation from "./auditCycle.validation.js";

const router = express.Router();
router.use(protect);

// Management actions restricted to Admins and Asset Managers
router.post("/", restrictTo("admin", "manager"), validateBody(validation.createAuditCycleSchema), controller.createCycle);
router.patch("/:id/start", restrictTo("admin", "manager"), controller.startCycle);
router.patch("/:id/close", restrictTo("admin", "manager"), controller.closeCycle);

// Read queries allowed for Admins, Managers, and Auditors
router.get("/", restrictTo("admin", "manager", "auditor"), controller.getCycles);
router.get("/:id/checklist", restrictTo("admin", "manager", "auditor"), controller.getChecklist);

export default router;
