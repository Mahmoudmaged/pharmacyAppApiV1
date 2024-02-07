import mongoose, { Schema, model } from "mongoose";

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
  },
  { timestamps: ture }
);

const ChronicDiseaseModel =
  mongoose.models.ChronicDisease ||
  model("ChronicDisease", chronicDiseaseSchema);

export default ChronicDiseaseModel;
