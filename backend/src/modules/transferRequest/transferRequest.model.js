import mongoose from "mongoose";

const transferRequestSchema = new mongoose.Schema({
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "asset",
        required: true,
    },
    fromEmployeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        // Optional because if null, it implies an allocation request for an available asset
    },
    toEmployeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const TransferRequest = mongoose.model("transferRequest", transferRequestSchema);

export default TransferRequest;
