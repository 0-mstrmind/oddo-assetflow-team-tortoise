import joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Get notifications query validation
export const getNotificationsQuery = joi.object({
    type: joi.string().valid('alert', 'approval', 'booking', 'info').allow('', null)
});

// Validate notification ID in params
export const notificationIdParam = joi.object({
    id: joi.string().pattern(objectIdPattern).required().messages({
        'string.pattern.base': 'Invalid Notification ID format'
    })
});
