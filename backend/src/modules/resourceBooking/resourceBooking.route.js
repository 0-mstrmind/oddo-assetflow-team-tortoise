import express from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./resourceBooking.controller.js";
import * as validation from "./resourceBooking.validation.js";

const router = express.Router();
router.use(protect);

router.post("/", validateBody(validation.bookResourceSchema), controller.bookResource);
router.get("/", controller.getAllBookings);
router.get("/my-bookings", controller.getMyBookings);
router.get("/resource/:resourceId/schedule", controller.getResourceSchedule);
router.patch("/:id/status", validateBody(validation.updateBookingStatusSchema), controller.updateBookingStatus);

export default router;
