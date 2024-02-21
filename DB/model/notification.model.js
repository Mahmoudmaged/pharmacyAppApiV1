import { Schema, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    sender: { type: Types.ObjectId, required: true },
    receiver: { type: Types.ObjectId, required: true },
    content: String,
    seen: boolean,
  },
  { timestamps: true }
);

const notificationModel =
  mongoose.models.User || model("Notification", notificationSchema);
export default notificationModel;
