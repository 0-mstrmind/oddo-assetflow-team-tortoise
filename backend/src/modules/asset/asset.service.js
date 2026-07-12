import Asset from "./asset.model.js";
import AssetAllocation from "../assetAllocation/assetAllocation.model.js";
import User from "../user/user.model.js";
import MaintenanceRequest from "../maintenanceRequest/maintenanceRequest.model.js";
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

  let serialNumber = data.serialNumber;
  if (!serialNumber || serialNumber.trim() === "") {
    let isUnique = false;
    while (!isUnique) {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestampPart = Date.now().toString().slice(-4);
      serialNumber = `SN-${timestampPart}-${randomPart}`;
      const existing = await Asset.findOne({ serialNumber });
      if (!existing) {
        isUnique = true;
      }
    }
  }

  const asset = await Asset.create({
    ...data,
    assetTag,
    serialNumber,
    qrCode
  });

  return await Asset.findById(asset._id).populate("categoryId", "name description");
};

// Retrieve detailed asset information including history
export const getAssetDetailsService = async (assetId) => {
  const asset = await Asset.findById(assetId).populate("categoryId", "name description");
  if (!asset) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset not found");
  }

  // Get active allocation (current holder)
  const currentAllocation = await AssetAllocation.findOne({
    assetId,
    status: "active"
  }).populate("employeeId", "name email role");

  // Get allocation history
  const allocationHistory = await AssetAllocation.find({ assetId })
    .sort({ allocatedAt: -1 })
    .populate("employeeId", "name email role")
    .populate("allocatedBy", "name email role");

  // Get maintenance history
  const maintenanceHistory = await MaintenanceRequest.find({ assetId })
    .sort({ createdAt: -1 })
    .populate("requestedBy", "name email role")
    .populate("approvedBy", "name email role")
    .populate("technicianId", "name email role");

  return {
    asset,
    currentHolder: currentAllocation ? currentAllocation.employeeId : null,
    allocationHistory,
    maintenanceHistory,
    documents: []
  };
};

// Update asset details
export const updateAssetService = async (assetId, updateData) => {
  if (updateData.assetTag) {
    const existing = await Asset.findOne({ assetTag: updateData.assetTag, _id: { $ne: assetId } });
    if (existing) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Asset Tag already exists");
    }
  }

  if (updateData.qrCode) {
    const existingQr = await Asset.findOne({ qrCode: updateData.qrCode, _id: { $ne: assetId } });
    if (existingQr) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "QR Code already registered");
    }
  }

  const asset = await Asset.findByIdAndUpdate(assetId, updateData, { new: true, runValidators: true })
    .populate("categoryId", "name description");

  if (!asset) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset not found");
  }

  return asset;
};

// Delete asset from database
export const deleteAssetService = async (assetId) => {
  const asset = await Asset.findByIdAndDelete(assetId);
  if (!asset) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset not found");
  }
  return asset;
};
