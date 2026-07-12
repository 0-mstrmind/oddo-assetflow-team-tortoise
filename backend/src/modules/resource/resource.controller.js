import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as resourceService from "./resource.service.js";

export const createResource = CatchAsync(async (req, res) => {
    const resource = await resourceService.createResourceService(req.body);
    sendResponse(res, StatusCodes.CREATED, "Resource created successfully", { resource });
});

export const getAllResources = CatchAsync(async (req, res) => {
    const resources = await resourceService.getAllResourcesService(req.query);
    sendResponse(res, StatusCodes.OK, "Resources retrieved", { resources });
});

export const getResourceById = CatchAsync(async (req, res) => {
    const resource = await resourceService.getResourceByIdService(req.params.id);
    sendResponse(res, StatusCodes.OK, "Resource retrieved", { resource });
});

export const updateResource = CatchAsync(async (req, res) => {
    const resource = await resourceService.updateResourceService(req.params.id, req.body);
    sendResponse(res, StatusCodes.OK, "Resource updated successfully", { resource });
});

export const deleteResource = CatchAsync(async (req, res) => {
    await resourceService.deleteResourceService(req.params.id);
    sendResponse(res, StatusCodes.OK, "Resource deleted successfully");
});
