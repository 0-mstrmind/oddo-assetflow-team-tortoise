import mongoose from "mongoose";

const resourceBookingSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "resource",
        required: true,
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed',
    },
}, {
    timestamps: true,
});

const ResourceBooking = mongoose.model("resourceBooking", resourceBookingSchema);

export default ResourceBooking;
