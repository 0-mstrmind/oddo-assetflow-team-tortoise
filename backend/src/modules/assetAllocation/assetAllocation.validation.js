import Joi from "joi";

// Helper for MongoDB ObjectId validation
const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const allocateAssetSchema = Joi.object({
    assetId: objectIdValidator.required(),
    employeeId: objectIdValidator.required(),
    expectedReturnDate: Joi.date().iso().greater('now').optional(),
});

export const returnAssetBodySchema = Joi.object({
    returnCondition: Joi.string().trim().max(500).optional(),
});

export const returnAssetParamsSchema = Joi.object({
    allocationId: objectIdValidator.required(),
});
