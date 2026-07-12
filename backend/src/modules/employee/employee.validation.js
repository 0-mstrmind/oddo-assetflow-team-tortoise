import joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Update employee validation schema
export const updateEmployeeInput = joi.object({
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
