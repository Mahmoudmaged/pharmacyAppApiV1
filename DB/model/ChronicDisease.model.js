import mongoose, { Schema, Types, model } from "mongoose";

export const chronicDiseaseSchema = new Schema(
  {
    disease: {
      AR: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      EN: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
    },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ChronicDiseaseModel =
  mongoose.models.ChronicDisease ||
  model("ChronicDisease", chronicDiseaseSchema);

export default ChronicDiseaseModel;
