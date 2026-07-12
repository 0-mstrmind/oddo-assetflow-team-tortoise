import mongoose from "mongoose";

const assetCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

const AssetCategory = mongoose.model("assetCategory", assetCategorySchema);

export default AssetCategory;
