import mongoose, { Schema, Types, model } from "mongoose";
const pharmacySchema = new Schema(
  {
    name: {
      AR: {
        type: String,
        lowercase: true,
        required: true,
        trim: true
      },
      EN: {
        type: String,
        lowercase: true,
        required: true,
        trim: true
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
      required: [true, 'password is required'],
    },
    country: { type: String, lowercase: true },

    address: {
      country: { type: String, lowercase: true },
      city: { type: String, lowercase: true },
      gov: { type: String, lowercase: true },
      details: String,
      location: { lat: String, lang: Number }
    },//in profile
    times: Array, //in profile
    phone: [{ code: String, number: String, mainNumber: { type: Boolean, default: false } }],

    license: String,//pdf file //in profile
    commercialRegister: String, //pdf file //in profile
    taxCard: String, //pdf file //in profile

    tempLicense: String,//pdf file //in profile
    tempCommercialRegister: String, //pdf file //in profile
    tempTaxCard: String, //pdf file //in profile

    image: String,
    imageFolderName: String,

    employee: {
      type: [{ type: Types.ObjectId, ref: "User" }],
    },
    approved: {
      type: Boolean,
      default: false,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    confirmCode: {
      type: String, // as we using hash algorithm
      default: null,
    },
    forgetCode: {
      type: String, // as we using hash algorithm
      default: null,
    },
    changePasswordTime: {
      type: Date,
    },

    socketId: String,
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    headquarter: { type: Types.ObjectId, ref: "Pharmacy" },
  },
  {
    timestamps: true,
  }
);

// const pharmacySchema = new Schema(
//   {
//     mainBranch: { type: branchSchema, required: true },
//     subBranches: { type: branchSchema},

//   },
//   {
//     timestamps: true,
//   }
// );

const pharmacyModel = mongoose.models.Pharmacy || model("Pharmacy", pharmacySchema);
export default pharmacyModel;
