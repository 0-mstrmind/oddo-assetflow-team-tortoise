import ResourceBooking from "./resourceBooking.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const bookResourceService = async (resourceId, bookedBy, startTime, endTime) => {
    const overlappingBooking = await ResourceBooking.findOne({
        resourceId,
        status: 'confirmed',
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    });

    if (overlappingBooking) {
        throw new ApiError(StatusCodes.CONFLICT, "The resource is already booked for the requested time slot.");
    }

    const booking = new ResourceBooking({
        resourceId,
        bookedBy,
        startTime,
        endTime,
    });

    return await booking.save();
};

export const updateBookingStatusService = async (bookingId, status, userId) => {
    const booking = await ResourceBooking.findById(bookingId);
    if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    
    booking.status = status;
    return await booking.save();
};

export const getAllBookingsService = async (query = {}) => {
    return await ResourceBooking.find(query)
        .populate('resourceId')
        .populate('bookedBy', 'name email');
};

export const getResourceScheduleService = async (resourceId, date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return await ResourceBooking.find({
        resourceId,
        status: { $ne: 'cancelled' },
        startTime: { $lte: dayEnd },
        endTime: { $gte: dayStart },
    })
    .populate('bookedBy', 'name email')
    .sort({ startTime: 1 });
};
