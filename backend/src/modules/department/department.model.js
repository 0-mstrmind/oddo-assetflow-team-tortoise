import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    headId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    parentDepartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "department",
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const Department = mongoose.model("department", departmentSchema);

export default Department;
