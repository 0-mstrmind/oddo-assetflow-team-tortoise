import Asset from "./asset.model.js";
import AssetAllocation from "../assetAllocation/assetAllocation.model.js";
import User from "../user/user.model.js";

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
