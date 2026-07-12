import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema({
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "asset",
        required: true,
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    },
    issue: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'in-progress', 'resolved', 'cancelled'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resolvedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

const MaintenanceRequest = mongoose.model("maintenanceRequest", maintenanceRequestSchema);

export default MaintenanceRequest;
