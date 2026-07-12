import Asset from "./asset.model.js";
import AssetAllocation from "../assetAllocation/assetAllocation.model.js";
import User from "../user/user.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Search and filter assets
export const searchAssetsService = async (filters) => {
  const query = {};

  // Case-insensitive search on assetTag, serialNumber, or qrCode
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { assetTag: searchRegex },
      { serialNumber: searchRegex },
      { qrCode: searchRegex }
    ];
  }

  // Filter by category
  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  // Filter by status
  if (filters.status) {
    query.status = filters.status;
  }

  // Filter by department
  if (filters.departmentId) {
    const employees = await User.find({ departmentId: filters.departmentId }).select("_id");
    const employeeIds = employees.map(e => e._id);
    
    const activeAllocations = await AssetAllocation.find({
      employeeId: { $in: employeeIds },
      status: "active"
    }).select("assetId");
    
    const assetIds = activeAllocations.map(a => a.assetId);
    query._id = { $in: assetIds };
  }

  return await Asset.find(query).populate("categoryId", "name description");
};

// Register a new asset
export const createAssetService = async (data) => {
  let assetTag = data.assetTag;
  if (!assetTag) {
    let isUnique = false;
    let count = await Asset.countDocuments();
    while (!isUnique) {
      count++;
      assetTag = `AST-${String(count).padStart(4, '0')}`;
      const existing = await Asset.findOne({ assetTag });
      if (!existing) {
        isUnique = true;
      }
    }
  } else {
    const existing = await Asset.findOne({ assetTag });
    if (existing) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Asset Tag already exists");
    }
  }

  const qrCode = data.qrCode || assetTag;
  if (data.qrCode) {
    const existingQr = await Asset.findOne({ qrCode: data.qrCode });
    if (existingQr) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "QR Code already registered");
    }
  }

  const asset = await Asset.create({
    ...data,
    assetTag,
    qrCode
  });

  return await Asset.findById(asset._id).populate("categoryId", "name description");
};
