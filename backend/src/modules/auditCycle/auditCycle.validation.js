import Joi from "joi";

export const createAuditCycleSchema = Joi.object({
    name: Joi.string().trim().required(),
    scope: Joi.string().trim().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
});
