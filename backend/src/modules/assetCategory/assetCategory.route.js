import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import {
  createAssetCategory,
  getAssetCategories,
  getAssetCategoryById,
  updateAssetCategory,
  deleteAssetCategory
} from "./assetCategory.controller.js";
import {
  createAssetCategoryInput,
  updateAssetCategoryInput
} from "./assetCategory.validation.js";

const router = express.Router();

// Apply authentication protection globally for all category routes
router.use(protect);

// Retrieve all asset categories
router.get("/", getAssetCategories);

// Retrieve single asset category by ID
router.get("/:id", getAssetCategoryById);

// Create asset category (restricted to admin)
router.post("/", restrictTo("admin"), validateBody(createAssetCategoryInput), createAssetCategory);

// Update asset category (restricted to admin)
router.patch("/:id", restrictTo("admin"), validateBody(updateAssetCategoryInput), updateAssetCategory);

// Delete asset category (restricted to admin)
router.delete("/:id", restrictTo("admin"), deleteAssetCategory);

export default router;
