import mongoose, { Schema, Types, model } from "mongoose";
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      // required: [true, 'fullName is required'],
      min: [2, "minimum length is 2 char"],
      max: [20, "max length is 20 char"],
      lowercase: true,
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
    address: [Object],
    gender: {
      type: String,
      default: "male",
      enum: ["male", "female"],
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
    country: { type: String, lowercase: true },
    socketId: String,
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
