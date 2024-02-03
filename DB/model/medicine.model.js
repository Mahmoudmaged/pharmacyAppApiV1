import mongoose, { model, Schema, Types } from "mongoose";

const medicineSchema = new Schema(
  {
    name: {
      AR: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      EN: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
    },
    slug: { type: String, required: true, lowercase: true },
    description: {
      AR: { type: String, trim: true, required: true },
      EN: { type: String, trim: true, required: true },
    },
    mainPrice: { type: Number, required: true },
    discountPercent: { type: Number, min: 0, max: 100 },
    salePrice: { type: Number },
    isDrug: { type: Boolean, required: true },
    images: [{ type: String, required: true }],
    brand: { type: Types.ObjectId, ref: "Brand" },
    category: { type: Types.ObjectId, ref: "Category" },
    sideEffects: [{ type: String, required: true }],
    indicationsForUse: { type: Object }, // TODO
    dose: { type: Object }, // TODO
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: [
      {
        id: { type: Types.ObjectId, ref: "User" },
        date: { type: Date },
        _id: false,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const medicineModel =
  mongoose.models.Medicine || model("Medicine", medicineSchema);
export default medicineModel;
