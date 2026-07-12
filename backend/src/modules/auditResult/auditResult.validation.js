import Joi from "joi";

const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const markResultSchema = Joi.object({
    auditCycleId: objectIdValidator.required(),
    assetId: objectIdValidator.required(),
    status: Joi.string().valid('verified', 'missing', 'damaged', 'misplaced').required(),
    remarks: Joi.string().trim().max(500).optional(),
});
