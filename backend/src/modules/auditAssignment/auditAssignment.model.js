import mongoose from "mongoose";

const auditAssignmentSchema = new mongoose.Schema({
    auditCycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auditCycle",
        required: true,
    },
    auditorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
}, {
    timestamps: true,
});

const AuditAssignment = mongoose.model("auditAssignment", auditAssignmentSchema);

export default AuditAssignment;
