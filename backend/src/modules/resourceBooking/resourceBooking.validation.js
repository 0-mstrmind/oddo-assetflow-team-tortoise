import Joi from "joi";

const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const bookResourceSchema = Joi.object({
    resourceId: objectIdValidator.required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
});

export const updateBookingStatusSchema = Joi.object({
    status: Joi.string().valid('cancelled', 'completed').required(),
});
