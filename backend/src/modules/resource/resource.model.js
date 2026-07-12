import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance', 'unavailable'],
        default: 'available',
    },
}, {
    timestamps: true,
});

const Resource = mongoose.model("resource", resourceSchema);

export default Resource;
