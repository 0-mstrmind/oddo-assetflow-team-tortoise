import Joi from "joi";

const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const raiseMaintenanceSchema = Joi.object({
    assetId: objectIdValidator.required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    issue: Joi.string().trim().max(1000).required(),
});

export const updateMaintenanceStatusSchema = Joi.object({
    status: Joi.string().valid('approved', 'in-progress', 'resolved', 'cancelled').required(),
    technicianId: Joi.when('status', {
        is: 'in-progress',
        then: objectIdValidator.required(),
        otherwise: objectIdValidator.optional()
    }),
});
