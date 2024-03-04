import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    address: {
        country: { type: String, default: 'Egypt', lowercase: true },
        city: { type: String, default: 'cairo', lowercase: true },
        gov: { type: String, lowercase: true },
        details: String,
        location: { lat: Number, lang: Number },
        
    },
    phone: [{ type: String, required: true }],
    note: String,
    products: [{
        name: { type: String, required: true },
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, required: true },
        unitPrice: { type: Number, default: 1, required: true },
        finalPrice: { type: Number, default: 1, required: true },
    }],
    couponId: { type: Types.ObjectId, ref: 'Coupon' },
    subtotal: { type: Number, default: 1, required: true },
    finalPrice: { type: Number, default: 1, required: true },
    paymentType: {
        type: String,
        default: 'cash',
        enum: ['cash', 'card']
    },
    status: {
        type: String,
        default: 'placed',
        enum: ['placed', 'accepted', 'canceled', 'rejected', 'onWay', 'delivered']
    },
    pharmacy: {
        pharmacyId: { type: Types.ObjectId, ref: 'Pharmacy' },
        employeeId: { type: Types.ObjectId, ref: 'User' },
    },
    reason: String
}, {
    timestamps: true
})

const orderModel = mongoose.models.Order || model('Order', orderSchema)
export default orderModel