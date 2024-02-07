import mongoose, { Schema, Types, model } from "mongoose";
const userSchema = new Schema(
  {
    fullName: {
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

    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "email is required"],
      lowercase: true,
    },
    password: {
      type: String,
      // required: [true, 'password is required'],
    },
    phone: {
      type: [Object],
    },
    gender: {
      AR: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        enum: ["ذكر", "انثى"],
      },
      EN: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        enum: ["male", "female"],
      },
    },
    DOB: String,
    role: {
      type: Types.ObjectId,
      ref: "Role",
      required: true,
      default: "65b6a78413524f005feca52a",
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
    wishlist: {
      type: [{ type: Types.ObjectId, ref: "Product" }],
    },
    provider: {
      type: String,
      default: "SYSTEM",
      enum: ["SYSTEM", "facebook", "GOOGLE"],
    },
    address: {
      country: { type: String, lowercase: true },
      city: { type: String, lowercase: true },
      gov: { type: String, lowercase: true },
    },
    height: { type: Number },
    weight: { type: Number },
    blood: { type: Number },
    chronicDiseases: [{ type: Types.ObjectId, ref: "ChronicDisease" }],
    socketId: String,
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
