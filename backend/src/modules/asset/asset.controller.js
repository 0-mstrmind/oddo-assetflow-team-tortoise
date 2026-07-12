import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import {
  searchAssetsService,
  createAssetService,
  getAssetDetailsService,
  updateAssetService,
  deleteAssetService
} from "./asset.service.js";

// Helper function to log activities
const logActivity = async (userId, action, entity, entityId, description) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entity,
      entityId,
      description
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// Retrieve and search assets
export const getAssets = CatchAsync(async (req, res) => {
  const assets = await searchAssetsService(req.query);
  sendResponse(res, StatusCodes.OK, "Assets retrieved successfully", { assets });
});

// Register a new asset
export const createAsset = CatchAsync(async (req, res) => {
  const asset = await createAssetService(req.body);
  await logActivity(
    req.user.userid,
    "CREATE",
    "Asset",
    asset._id,
    `Asset ${asset.name} (${asset.assetTag}) registered`
  );
  sendResponse(res, StatusCodes.CREATED, "Asset registered successfully", { asset });
});

// Retrieve single asset with full allocation and maintenance history
export const getAssetById = CatchAsync(async (req, res) => {
  const details = await getAssetDetailsService(req.params.id);
  sendResponse(res, StatusCodes.OK, "Asset details retrieved successfully", details);
});

// Update asset details (restricted to admin)
export const updateAsset = CatchAsync(async (req, res) => {
  const asset = await updateAssetService(req.params.id, req.body);
  await logActivity(
    req.user.userid,
    "UPDATE",
    "Asset",
    asset._id,
    `Asset ${asset.name} (${asset.assetTag}) updated`
  );
  sendResponse(res, StatusCodes.OK, "Asset updated successfully", { asset });
});

// Delete asset (restricted to admin)
export const deleteAsset = CatchAsync(async (req, res) => {
  const asset = await deleteAssetService(req.params.id);
  await logActivity(
    req.user.userid,
    "DELETE",
    "Asset",
    req.params.id,
    `Asset ${asset.name} (${asset.assetTag}) deleted`
  );
  sendResponse(res, StatusCodes.OK, "Asset deleted successfully");
});
