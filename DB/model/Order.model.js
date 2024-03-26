import mongoose, { model, Schema, Types } from "mongoose";

const addressSchema = new Schema({
  country: { type: String, default: "Egypt", lowercase: true },
  city: { type: String, default: "cairo", lowercase: true },
  gov: { type: String, lowercase: true },
  details: String,
  location: { lat: Number, lang: Number },
});

function isRequired() {
  return this.status == "dummy" ? false : true;
}

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    address: {
      type: addressSchema,
      required: isRequired,
    },
    phone: { type: String, required: isRequired },
    note: String,
    products: [
      {
        name: { type: String, required: true },
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, required: true },
        unitPrice: { type: Number, default: 1, required: true },
        finalPrice: { type: Number, default: 1, required: true },
      },
    ],
    couponId: { type: Types.ObjectId, ref: "Coupon" },
    subtotal: { type: Number, default: 1, required: true },
    finalPrice: { type: Number, default: 1, required: true },
    paymentType: {
      type: String,
      default: "cash",
      enum: ["cash", "card"],
    },
    status: {
      type: String,
      default: "placed",
      enum: [
        "placed", // client placed normal order || client accepted dummy order
        "dummy", // system accept the ticket || system accepted order with drugs
        "closed-dummy", // 24 hours passed with out action from system or client
        "rejected", // system rejected order with drugs
        "onWay",
        "delivered",
      ],
    },
    pharmacy: {
      pharmacyId: { type: Types.ObjectId, ref: "Pharmacy" },
      employeeId: { type: Types.ObjectId, ref: "User" },
    },
    reason: String,
    prescription: String,
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.models.Order || model("Order", orderSchema);
export default orderModel;
