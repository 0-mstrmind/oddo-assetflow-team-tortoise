import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    entity: {
        type: String,
        required: true,
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
}, {
    timestamps: true,
});

const ActivityLog = mongoose.model("activityLog", activityLogSchema);

export default ActivityLog;
