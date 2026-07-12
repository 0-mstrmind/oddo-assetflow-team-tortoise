import joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Create department validation schema
export const createDepartmentInput = joi.object({
    name: joi.string().required().messages({
        'any.required': 'Department name is required'
    }),
    headId: joi.string().pattern(objectIdPattern).allow(null, '').messages({
        'string.pattern.base': 'Invalid Head ID format'
    }),
    parentDepartmentId: joi.string().pattern(objectIdPattern).allow(null, '').messages({
        'string.pattern.base': 'Invalid Parent Department ID format'
    }),
    status: joi.string().valid('active', 'inactive').default('active')
});

// Update department validation schema
export const updateDepartmentInput = joi.object({
    name: joi.string(),
    headId: joi.string().pattern(objectIdPattern).allow(null, ''),
    parentDepartmentId: joi.string().pattern(objectIdPattern).allow(null, ''),
    status: joi.string().valid('active', 'inactive')
});
