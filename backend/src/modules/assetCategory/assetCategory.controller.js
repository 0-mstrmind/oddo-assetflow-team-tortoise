import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import {
  createAssetCategoryService,
  getAssetCategoriesService,
  getAssetCategoryByIdService,
  updateAssetCategoryService,
  deleteAssetCategoryService
} from "./assetCategory.service.js";

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

// Create an asset category
export const createAssetCategory = CatchAsync(async (req, res) => {
  const category = await createAssetCategoryService(req.body);
  await logActivity(
    req.user.userid,
    "CREATE",
    "AssetCategory",
    category._id,
    `Asset category ${category.name} created`
  );
  sendResponse(res, StatusCodes.CREATED, "Asset category created successfully", { category });
});

// Retrieve all asset categories
export const getAssetCategories = CatchAsync(async (req, res) => {
  const categories = await getAssetCategoriesService();
  sendResponse(res, StatusCodes.OK, "Asset categories retrieved successfully", { categories });
});

// Retrieve asset category by ID
export const getAssetCategoryById = CatchAsync(async (req, res) => {
  const category = await getAssetCategoryByIdService(req.params.id);
  sendResponse(res, StatusCodes.OK, "Asset category retrieved successfully", { category });
});

// Update asset category details
export const updateAssetCategory = CatchAsync(async (req, res) => {
  const category = await updateAssetCategoryService(req.params.id, req.body);
  await logActivity(
    req.user.userid,
    "UPDATE",
    "AssetCategory",
    category._id,
    `Asset category ${category.name} updated`
  );
  sendResponse(res, StatusCodes.OK, "Asset category updated successfully", { category });
});

// Delete asset category
export const deleteAssetCategory = CatchAsync(async (req, res) => {
  const category = await deleteAssetCategoryService(req.params.id);
  await logActivity(
    req.user.userid,
    "DELETE",
    "AssetCategory",
    req.params.id,
    `Asset category ${category.name} deleted`
  );
  sendResponse(res, StatusCodes.OK, "Asset category deleted successfully");
});
