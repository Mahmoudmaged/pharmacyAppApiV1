
import mongoose, { Schema, Types, model } from "mongoose";
const variantSchema = new Schema(
  {
    medicine: { type: Types.ObjectId, ref: "Medicine", required: true },
    size: { type: String },
    color: { type: String },
    soldItems: { type: Number, default: 0 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const variantModel = mongoose.models.Variant || model("Variant", variantSchema);
export default variantModel;
