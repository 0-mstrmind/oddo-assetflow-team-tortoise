import joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Asset search and list query validations
export const searchAssetQuery = joi.object({
    search: joi.string().allow('', null),
    categoryId: joi.string().pattern(objectIdPattern).allow('', null),
    status: joi.string().valid('available', 'allocated', 'maintenance', 'retired', 'reserved').allow('', null),
    departmentId: joi.string().pattern(objectIdPattern).allow('', null)
});
