import joi from "joi";

// Create asset category validation schema
export const createAssetCategoryInput = joi.object({
    name: joi.string().required().messages({
        'any.required': 'Asset category name is required'
    }),
    description: joi.string().allow('', null)
});

// Update asset category validation schema
export const updateAssetCategoryInput = joi.object({
    name: joi.string(),
    description: joi.string().allow('', null)
});
