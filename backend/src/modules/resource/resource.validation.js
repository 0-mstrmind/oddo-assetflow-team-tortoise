import Joi from "joi";

const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message("Invalid ID format");

export const createResourceSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    type: Joi.string().trim().min(2).max(50).required(),
    location: Joi.string().trim().max(200).optional(),
});

export const updateResourceSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    type: Joi.string().trim().min(2).max(50).optional(),
    location: Joi.string().trim().max(200).optional(),
    status: Joi.string().valid('available', 'booked', 'maintenance', 'unavailable').optional(),
});

export const resourceIdParamSchema = Joi.object({
    id: objectIdValidator.required(),
});
