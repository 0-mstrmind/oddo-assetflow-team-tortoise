import joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Asset search and list query validations
export const searchAssetQuery = joi.object({
    search: joi.string().allow('', null),
    categoryId: joi.string().pattern(objectIdPattern).allow('', null),
    status: joi.string().valid('available', 'allocated', 'maintenance', 'retired', 'reserved').allow('', null),
    departmentId: joi.string().pattern(objectIdPattern).allow('', null)
});

// Create asset input validation schema
export const createAssetInput = joi.object({
    name: joi.string().required().messages({
        'any.required': 'Asset name is required'
    }),
    categoryId: joi.string().pattern(objectIdPattern).required().messages({
        'any.required': 'Category ID is required',
        'string.pattern.base': 'Invalid Category ID format'
    }),
    serialNumber: joi.string().allow('', null),
    location: joi.string().allow('', null),
    acquisitionCost: joi.number().min(0).allow(null),
    condition: joi.string().valid('new', 'good', 'fair', 'poor', 'damaged').default('new'),
    isBookable: joi.boolean().default(false),
    assetTag: joi.string().allow('', null),
    qrCode: joi.string().allow('', null)
});

// Validate asset ID in params
export const assetIdParam = joi.object({
    id: joi.string().pattern(objectIdPattern).required().messages({
        'string.pattern.base': 'Invalid Asset ID format'
    })
});

// Update asset input validation schema
export const updateAssetInput = joi.object({
    name: joi.string(),
    categoryId: joi.string().pattern(objectIdPattern).messages({
        'string.pattern.base': 'Invalid Category ID format'
    }),
    serialNumber: joi.string().allow('', null),
    location: joi.string().allow('', null),
    acquisitionCost: joi.number().min(0).allow(null),
    condition: joi.string().valid('new', 'good', 'fair', 'poor', 'damaged'),
    isBookable: joi.boolean(),
    status: joi.string().valid('available', 'allocated', 'maintenance', 'retired', 'reserved'),
    assetTag: joi.string(),
    qrCode: joi.string().allow('', null)
});
