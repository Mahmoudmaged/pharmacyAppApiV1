import mongoose, { Schema, Types, model } from "mongoose";
const PharmacyRequestSchema = new Schema(
  {
    pharmacyId: { type: Types.ObjectId, ref: "Pharmacy", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    approvedBy: { type: Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: false },
    recheck: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);



const PharmacyRequestModel = mongoose.models.PharmacyRequest || model("PharmacyRequest", PharmacyRequestSchema);
export default PharmacyRequestModel;
