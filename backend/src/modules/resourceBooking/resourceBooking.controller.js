import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as bookingService from "./resourceBooking.service.js";

export const bookResource = CatchAsync(async (req, res) => {
    const { resourceId, startTime, endTime } = req.body;
    const bookedBy = req.user.id;
    
    const booking = await bookingService.bookResourceService(resourceId, bookedBy, startTime, endTime);
    sendResponse(res, StatusCodes.CREATED, "Resource booked successfully", { booking });
});

export const updateBookingStatus = CatchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    const booking = await bookingService.updateBookingStatusService(id, status, userId);
    sendResponse(res, StatusCodes.OK, `Booking status updated to ${status}`, { booking });
});

export const getMyBookings = CatchAsync(async (req, res) => {
    const bookings = await bookingService.getAllBookingsService({ bookedBy: req.user.id });
    sendResponse(res, StatusCodes.OK, "Bookings retrieved", { bookings });
});

export const getAllBookings = CatchAsync(async (req, res) => {
    const bookings = await bookingService.getAllBookingsService(req.query);
    sendResponse(res, StatusCodes.OK, "All bookings retrieved", { bookings });
});

export const getResourceSchedule = CatchAsync(async (req, res) => {
    const { resourceId } = req.params;
    const { date } = req.query;
    const schedule = await bookingService.getResourceScheduleService(resourceId, date || new Date());
    sendResponse(res, StatusCodes.OK, "Resource schedule retrieved", { schedule });
});
