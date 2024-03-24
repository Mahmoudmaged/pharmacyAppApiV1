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
    isDrug: { type: Boolean, default: false, required: true },
    soldQuantity: { type: Number, default: 0 },
    images: [{ type: String }],
    imageFolderName: { type: String, required: true, unique: true },
    brand: { type: Types.ObjectId, ref: "Brand" },
    category: { type: Types.ObjectId, ref: "Category" },
    sideEffects: [
      {
        AR: { type: String, required: true },
        EN: { type: String, required: true },
      },
    ],
    indicationsForUse: [
      {
        AR: { type: String },
        EN: { type: String },
      },
    ], // TODO
    dose: [
      {
        startAge: Number,
        endAge: Number,
        dose: {
          AR: { type: String },
          EN: { type: String },
        },
      },
    ], // TODO
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    // updatedBy: [
    //   {
    //     id: { type: Types.ObjectId, ref: "User" },
    //     date: { type: Date },
    //     _id: false,
    //   },
    // ],

    isDeleted: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

medicineSchema.virtual("variant", {
  ref: "Variant",
  localField: "_id",
  foreignField: "medicine",
});

const medicineModel =
  mongoose.models.Medicine || model("Medicine", medicineSchema);
export default medicineModel;
