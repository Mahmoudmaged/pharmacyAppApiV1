import mongoose, { model, Schema, Types } from "mongoose";

const wishlistSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    products: [{ type: Types.ObjectId, ref: 'Medicine' }],
}, {
    timestamps: true
})

const wishlistModel = mongoose.models.Wishlist || model('Wishlist', wishlistSchema)
export default wishlistModel