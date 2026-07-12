import Resource from "./resource.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const createResourceService = async (data) => {
    const existing = await Resource.findOne({ name: data.name });
    if (existing) {
        throw new ApiError(StatusCodes.CONFLICT, "A resource with this name already exists");
    }
    return await Resource.create(data);
};

export const getAllResourcesService = async (query = {}) => {
    return await Resource.find(query);
};

export const getResourceByIdService = async (id) => {
    const resource = await Resource.findById(id);
    if (!resource) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found");
    }
    return resource;
};

export const updateResourceService = async (id, data) => {
    if (data.name) {
        const existing = await Resource.findOne({ name: data.name, _id: { $ne: id } });
        if (existing) {
            throw new ApiError(StatusCodes.CONFLICT, "A resource with this name already exists");
        }
    }
    const resource = await Resource.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!resource) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found");
    }
    return resource;
};

export const deleteResourceService = async (id) => {
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found");
    }
    return resource;
};
