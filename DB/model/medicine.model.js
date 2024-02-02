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
      AR: { type: String, trim: true },
      EN: { type: String, trim: true },
    },
    mainPrice: { type: Number, required: true },
    discountPercent: { type: Number, min: 0, max: 100 },
    salePrice: { type: Number },
    isDrug: { type: Boolean, required: true },
    image: [{ type: String, required: true }],
    brand: { type: Types.ObjectId, ref: "Brand" },
    category: { type: Types.ObjectId, ref: "Category" },
    sideEffects: [{ type: String, required: true }],
    indicationsForUse: { type: Object },
    dose: { type: Object },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: [{ type: Types.ObjectId, ref: "User" }],
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
