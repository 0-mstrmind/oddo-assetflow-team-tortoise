import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./transferRequest.controller.js";
import * as validation from "./transferRequest.validation.js";

const router = express.Router();
router.use(protect);

router.post("/", validateBody(validation.createTransferSchema), controller.requestTransfer);
router.get("/my-transfers", controller.getMyTransfers);
router.get("/my-requests", controller.getMyRequests);

router.use(restrictTo("admin", "manager"));
router.get("/", controller.getAllTransfers);
router.get("/pending", controller.getPendingTransfers);
router.patch("/:id/status", validateBody(validation.updateTransferStatusSchema), controller.updateTransferStatus);

export default router;
