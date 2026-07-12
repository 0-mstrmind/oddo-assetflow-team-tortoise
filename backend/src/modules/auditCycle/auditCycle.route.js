import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./auditCycle.controller.js";
import * as validation from "./auditCycle.validation.js";

const router = express.Router();
router.use(protect);

// Only Admins and Asset Managers should manage audit cycles
router.use(restrictTo("Admin", "Asset Manager"));

router.post("/", validateBody(validation.createAuditCycleSchema), controller.createCycle);
router.get("/", controller.getCycles);
router.patch("/:id/close", controller.closeCycle);

export default router;
