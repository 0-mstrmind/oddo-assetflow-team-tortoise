import mongoose from "mongoose";

const discrepancyItemSchema = new mongoose.Schema({
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "asset" },
    assetTag: { type: String },
    assetName: { type: String },
    location: { type: String },
    status: { type: String, enum: ['missing', 'damaged', 'misplaced'] },
    condition: { type: String },
    remarks: { type: String },
}, { _id: false });

const auditReportSchema = new mongoose.Schema({
    auditCycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auditCycle",
        required: true,
        unique: true,
    },
    cycleName: { type: String, required: true },
    scope: { type: String },
    closedAt: { type: Date, default: Date.now },
    stats: {
        total: { type: Number, default: 0 },
        verified: { type: Number, default: 0 },
        missing: { type: Number, default: 0 },
        damaged: { type: Number, default: 0 },
        misplaced: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
    },
    discrepancies: [discrepancyItemSchema],
}, { timestamps: true });

const AuditReport = mongoose.model("auditReport", auditReportSchema);

export default AuditReport;
