import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import { searchAssetsService } from "./asset.service.js";

// Retrieve and search assets
export const getAssets = CatchAsync(async (req, res) => {
  const assets = await searchAssetsService(req.query);
  sendResponse(res, StatusCodes.OK, "Assets retrieved successfully", { assets });
});
