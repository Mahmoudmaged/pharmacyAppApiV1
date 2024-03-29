import mongoose, { model, Schema, Types } from "mongoose";

const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    imageFolderName: { type: String },
    description: { type: String, trim: true, lowercase: true },
    duration: { type: Number, required: true },
    image: { type: String },
    amount: { type: Number, default: 1 },
    expire: { type: Date, required: true },
    usedBy: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const couponModel = mongoose.models.Coupon || model("Coupon", couponSchema);
export default couponModel;
