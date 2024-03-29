import mongoose, { Schema, Types, model } from "mongoose";
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "email is required"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: [{ code: String, number: String }],
    },
    gender: {
      AR: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        enum: ["ذكر", "انثى"],
        default: "ذكر",
      },
      EN: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        enum: ["male", "female"],
        default: "male",
      },
    },
    DOB: String,
    role: {
      type: Types.ObjectId,
      ref: "Role",
      required: true,
      default: "65c8a05679edf7c95768f418",
    },
    status: {
      type: String,
      default: "offline",
      enum: ["offline", "online", "blocked"],
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    confirmCode: {
      type: String, // as we using hash algorithm
      default: null,
    },
    image: String,
    forgetCode: {
      type: String, // as we using hash algorithm
      default: null,
    },
    changePasswordTime: {
      type: Date,
      /*
          as we consider all pervious generated token before forget or change password is in-valid 
          and force  all other login devices of the same user to enter the  new password
         */
    },
    provider: {
      type: String,
      default: "SYSTEM",
      enum: ["SYSTEM", "FACEBOOK", "GOOGLE"],
    },
    country: { type: String, lowercase: true },
    address: [
      {
        country: { type: String, lowercase: true },
        city: { type: String, lowercase: true },
        gov: { type: String, lowercase: true },
        details: String,
        mainAddress: { type: Boolean, default: false },
        location: { lat: Number, lang: Number },
      },
    ],

    measurements: {
      height: { type: Number },
      weight: { type: Number },
      blood: { type: String, enum: ['o+', 'o-', 'a+', 'a-', 'B+', 'B-', 'AB+', 'AB-'] },
    },
    chronicDiseases: [{ type: Types.ObjectId, ref: "ChronicDisease" }],
    playerId: { type: String },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
