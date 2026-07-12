import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['admin', 'employee', 'auditor', 'technician', 'manager'],
        default: 'employee',
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "department",
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    },

    refreshToken: {
        type: String,
        select: true,
    },
}, {
    timestamps: true,
});

const User = mongoose.model("user", userSchema);

export default User;