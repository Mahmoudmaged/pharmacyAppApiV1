import mongoose, { model, Schema, Types } from "mongoose";

const brandSchema = new Schema({
    name: {
        AR: { type: String, required: true, unique: true, lowercase: true, trim: true },
        EN: { type: String, required: true, unique: true, lowercase: true, trim: true },
    },
    slug: { type: String, required: true, unique: true, lowercase: true },

    image: { type: String, required: true },
    imageFolderName: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
})

const brandModel = mongoose.models.Brand || model('Brand', brandSchema)
export default brandModel