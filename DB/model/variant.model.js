import { Schema, Types, model } from "mongoose";

const variantSchema = new Schema(
  {
    medicine: { type: Types.ObjectId, ref: "Mdedicine", required: true },
    size: { type: String },
    color: { type: String },
    soldItems: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const variantModel = mongoose.models.Variant || model("Variant", variantSchema);
export default variantModel;
