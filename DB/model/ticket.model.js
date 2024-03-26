import mongoose, { model, Schema, Types } from "mongoose";

const ticketSchema = new Schema(
  {
    text: String,
    file: String,
    user: { type: Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      default: "opened",
      enum: ["opened", "closed"], // closed when system or client rejects the ticket
    },
    order: { type: Types.ObjectId, ref: "Order" },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

const ticketModel = mongoose.models.Ticket || model("Ticket", ticketSchema);
export default ticketModel;
