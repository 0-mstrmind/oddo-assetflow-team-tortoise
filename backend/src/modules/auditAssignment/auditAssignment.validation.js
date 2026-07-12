import Joi from "joi";

const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const assignAuditorSchema = Joi.object({
    auditCycleId: objectIdValidator.required(),
    auditorId: objectIdValidator.required(),
});
