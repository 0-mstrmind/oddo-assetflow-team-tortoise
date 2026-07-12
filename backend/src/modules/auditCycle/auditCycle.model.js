import mongoose from "mongoose";

const auditCycleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    scope: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'cancelled'],
        default: 'planned',
    },
}, {
    timestamps: true,
});

const AuditCycle = mongoose.model("auditCycle", auditCycleSchema);

export default AuditCycle;
