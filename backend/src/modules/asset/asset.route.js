import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateQuery, validateBody } from "../../core/middleware/validateRequest.middleware.js";
import { getAssets, createAsset } from "./asset.controller.js";
import { searchAssetQuery, createAssetInput } from "./asset.validation.js";

const router = express.Router();

// Apply auth protection globally for all asset routes
router.use(protect);

// Retrieve and search assets directory
router.get("/", validateQuery(searchAssetQuery), getAssets);

// Register a new asset (restricted to admin)
router.post("/", restrictTo("admin"), validateBody(createAssetInput), createAsset);

export default router;
