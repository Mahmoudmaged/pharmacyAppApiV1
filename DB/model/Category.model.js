import mongoose, { model, Schema, Types } from "mongoose";
const categorySchema = new Schema({
    name: {
        AR: { type: String, required: true, unique: true, lowercase: true, trim: true },
        EN: { type: String, required: true, unique: true, lowercase: true, trim: true },
    },
    slug: { type: String, required: true, lowercase: true },
    description: {
        AR: { type: String, trim: true },
        EN: { type: String, trim: true },
    },
    image: { type: String },
    imageFolderName: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    brandIds: [{ type: Types.ObjectId, ref: 'Brand' }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})


const categoryModel = mongoose.models.Category || model('Category', categorySchema)
export default categoryModel