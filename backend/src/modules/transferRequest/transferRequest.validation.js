import Joi from "joi";

const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const createTransferSchema = Joi.object({
    assetId: objectIdValidator.required(),
    toEmployeeId: objectIdValidator.optional(), // Optional — backend auto-assigns to requester if omitted
    reason: Joi.string().trim().max(500).required(),
});

export const updateTransferStatusSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
});
