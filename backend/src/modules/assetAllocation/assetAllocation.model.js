import mongoose from "mongoose";

const assetAllocationSchema = new mongoose.Schema({
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "asset",
        required: true,
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    allocatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    allocatedAt: {
        type: Date,
        default: Date.now,
    },
    expectedReturnDate: {
        type: Date,
    },
    returnedAt: {
        type: Date,
    },
    returnCondition: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'returned', 'overdue'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const AssetAllocation = mongoose.model("assetAllocation", assetAllocationSchema);

export default AssetAllocation;
