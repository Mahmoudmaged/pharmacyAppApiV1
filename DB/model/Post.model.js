import mongoose, { model, Schema, Types } from "mongoose";

const postSchema = new Schema({
    title: { type: String, required: true, },
    description: { type: String, required: true, },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
})

const postModel = mongoose.models.Post || model('Post', postSchema)
export default postModel