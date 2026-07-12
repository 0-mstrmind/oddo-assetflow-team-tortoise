import express from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { validateQuery } from "../../core/middleware/validateRequest.middleware.js";
import { getAssets } from "./asset.controller.js";
import { searchAssetQuery } from "./asset.validation.js";

const router = express.Router();

// Apply auth protection globally for all asset routes
router.use(protect);

// Retrieve and search assets directory
router.get("/", validateQuery(searchAssetQuery), getAssets);

export default router;
