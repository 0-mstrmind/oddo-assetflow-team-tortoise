import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody, validateParams } from "../../core/middleware/validateRequest.middleware.js";
import * as allocationController from "./assetAllocation.controller.js";
import * as validation from "./assetAllocation.validation.js";


const router = express.Router();

// Require authentication for all allocation routes
router.use(protect);

// Employee routes
router.get("/my-allocations", allocationController.getUserAllocations);

// Admin / Manager / Dept Head routes
router.use(restrictTo("Admin", "Asset Manager", "Department Head"));

router.get("/", allocationController.getAllAllocations);
router.get("/overdue", allocationController.getOverdueAllocations);
router.post("/", validateBody(validation.allocateAssetSchema), allocationController.allocateAsset);
router.patch("/:allocationId/return", validateParams(validation.returnAssetParamsSchema), validateBody(validation.returnAssetBodySchema), allocationController.returnAsset);


export default router;
