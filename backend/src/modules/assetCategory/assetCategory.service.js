import AssetCategory from "./assetCategory.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Create a new asset category
export const createAssetCategoryService = async (data) => {
  const existing = await AssetCategory.findOne({ name: data.name });
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Asset category already exists");
  }
  return await AssetCategory.create(data);
};

// Retrieve all asset categories
export const getAssetCategoriesService = async () => {
  return await AssetCategory.find();
};

// Retrieve single asset category by ID
export const getAssetCategoryByIdService = async (id) => {
  const category = await AssetCategory.findById(id);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset category not found");
  }
  return category;
};

// Update asset category details
export const updateAssetCategoryService = async (id, data) => {
  if (data.name) {
    const existing = await AssetCategory.findOne({ name: data.name, _id: { $ne: id } });
    if (existing) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Asset category already exists");
    }
  }
  const category = await AssetCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset category not found");
  }
  return category;
};

// Delete asset category from database
export const deleteAssetCategoryService = async (id) => {
  const category = await AssetCategory.findByIdAndDelete(id);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset category not found");
  }
  return category;
};
