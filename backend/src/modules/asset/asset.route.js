import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateQuery, validateBody, validateParams } from "../../core/middleware/validateRequest.middleware.js";
import { getAssets, createAsset, getAssetById, updateAsset, deleteAsset } from "./asset.controller.js";
import { searchAssetQuery, createAssetInput, assetIdParam, updateAssetInput } from "./asset.validation.js";

const router = express.Router();

// Apply auth protection globally for all asset routes
router.use(protect);

// Retrieve and search assets directory
router.get("/", validateQuery(searchAssetQuery), getAssets);

// Register a new asset (restricted to admin)
router.post("/", restrictTo("admin"), validateBody(createAssetInput), createAsset);

// Retrieve single asset details with allocation and maintenance history
router.get("/:id", validateParams(assetIdParam), getAssetById);

// Update asset details (restricted to admin)
router.patch("/:id", restrictTo("admin"), validateParams(assetIdParam), validateBody(updateAssetInput), updateAsset);

// Delete asset from database (restricted to admin)
router.delete("/:id", restrictTo("admin"), validateParams(assetIdParam), deleteAsset);

export default router;
