import joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Department input validations
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

export const updateDepartmentInput = joi.object({
    name: joi.string(),
    headId: joi.string().pattern(objectIdPattern).allow(null, ''),
    parentDepartmentId: joi.string().pattern(objectIdPattern).allow(null, ''),
    status: joi.string().valid('active', 'inactive')
});

// Asset Category input validations
export const createAssetCategoryInput = joi.object({
    name: joi.string().required().messages({
        'any.required': 'Asset Category name is required'
    }),
    description: joi.string().allow('', null)
});

export const updateAssetCategoryInput = joi.object({
    name: joi.string(),
    description: joi.string().allow('', null)
});

// Audit Cycle input validations
export const createAuditCycleInput = joi.object({
    name: joi.string().required().messages({
        'any.required': 'Audit Cycle name is required'
    }),
    scope: joi.string().allow('', null),
    startDate: joi.date().required().messages({
        'any.required': 'Start date is required'
    }),
    endDate: joi.date().min(joi.ref('startDate')).required().messages({
        'any.required': 'End date is required',
        'date.min': 'End date must be greater than or equal to start date'
    }),
    status: joi.string().valid('planned', 'in-progress', 'completed', 'cancelled').default('planned')
});

export const updateAuditCycleInput = joi.object({
    name: joi.string(),
    scope: joi.string().allow('', null),
    startDate: joi.date(),
    endDate: joi.date().min(joi.ref('startDate')).messages({
        'date.min': 'End date must be greater than or equal to start date'
    }),
    status: joi.string().valid('planned', 'in-progress', 'completed', 'cancelled')
});

// Employee Assignment validations
export const updateEmployeeAssignmentInput = joi.object({
    role: joi.string().valid('admin', 'employee', 'auditor', 'technician', 'manager').messages({
        'any.only': 'Invalid role'
    }),
    departmentId: joi.string().pattern(objectIdPattern).allow(null, '').messages({
        'string.pattern.base': 'Invalid Department ID format'
    }),
    status: joi.string().valid('active', 'inactive', 'suspended').messages({
        'any.only': 'Invalid status'
    })
}).or('role', 'departmentId', 'status').messages({
    'object.missing': 'At least one of role, departmentId, or status must be updated'
});
