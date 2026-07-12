import mongoose from "mongoose";

const auditResultSchema = new mongoose.Schema({
    auditCycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auditCycle",
        required: true,
    },
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "asset",
        required: true,
    },
    status: {
        type: String,
        enum: ['verified', 'missing', 'damaged', 'misplaced'],
        required: true,
    },
    remarks: {
        type: String,
    },
}, {
    timestamps: true,
});

const AuditResult = mongoose.model("auditResult", auditResultSchema);

export default AuditResult;
