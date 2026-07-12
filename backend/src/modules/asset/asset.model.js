import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    assetTag: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "assetCategory",
        required: true,
    },
    serialNumber: {
        type: String,
        trim: true,
    },
    acquisitionDate: {
        type: Date,
    },
    acquisitionCost: {
        type: Number,
    },
    condition: {
        type: String,
        default: 'new',
    },
    location: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['available', 'allocated', 'maintenance', 'retired', 'reserved'],
        default: 'available',
    },
    isBookable: {
        type: Boolean,
        default: false,
    },
    qrCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const Asset = mongoose.model("asset", assetSchema);

export default Asset;
