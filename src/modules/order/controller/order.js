import couponModel from '../../../../DB/model/Coupon.model.js'
import orderModel from '../../../../DB/model/Order.model.js';
import productModel from '../../../../DB/model/Product.model.js';
import cartModel from '../../../../DB/model/Cart.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import { deleteItemsFromCart, emptyCart } from '../../cart/controller/cart.js';
import { createInvoice } from '../../../utils/pdf.js';
import sendEmail from '../../../utils/email.js';
import payment from '../../../utils/payment.js';
// import payment from '../../../utils/newPayment.js';

import Stripe from 'stripe';



export const createOrder = async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const { address, phone, note, couponName, paymentType } = req.body;

    if (!req.body.products) {
        const cart = await cartModel.findOne({ userId: req.user._id })
        if (!cart?.products?.length) {
            return next(new Error(lang == "EN" ? `empty cart` : "عفوا ولكن عربه التسوق فارغه", { cause: { code: 409, customCode: 1011 } }))

        }
        req.body.isCart = true
        req.body.products = cart.products
    }

    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName.toLowerCase(), usedBy: { $nin: req.user._id } })
        if (!coupon || coupon.expire.getTime() < Date.now()) {
            return next(new Error('In-valid or expired coupon', { cause: 400 }))
        }
        req.body.coupon = coupon
    }
    const productIds = [];
    const finalProductList = [];
    let subtotal = 0;

    for (let product of req.body.products) {

        const checkedProduct = await productModel.findOne({
            _id: product.productId,
            isDeleted: false
        })

        if (!checkedProduct) {
            return next(new Error(`In-valid product  with id ${product.productId}`, { cause: 400 }))
        }
        if (req.body.isCart) {
            // product  = > BSOn object
            product = product.toObject()
        }
        productIds.push(product.productId);
        product.name = checkedProduct.name;
        product.unitPrice = checkedProduct.finalPrice;
        product.finalPrice = product.quantity * checkedProduct.finalPrice.toFixed(2);
        finalProductList.push(product)
        subtotal += product.finalPrice

    }
    const order = await orderModel.create({
        userId: req.user._id,
        address,
        phone,
        note,
        products: finalProductList,
        couponId: req.body.coupon?._id,
        subtotal,
        finalPrice: subtotal - (subtotal * ((req.body.coupon?.amount || 0) / 100)).toFixed(2),
        paymentType,
        // status: paymentType == "card" ? "waitPayment" : 'placed'
        status: 'placed'
    })
 
    //push user id in  coupon usedBy
    if (req.body.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }
    // clear items cart 
    if (req.body.isCart) {
        await emptyCart(req.user._id)
    } else {
        await deleteItemsFromCart(productIds, req.user._id)
    }


    return res.status(201).json({ message: "Done", order })

}



export const cancelOrder = asyncHandler(async (req, res, next) => {

    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await orderModel.findOne({ _id: orderId, userId: req.user._id })

    if (!order) {
        return next(new Error(`In-valid order Id`, { cause: 404 }))

    }
    if ((order?.status != "placed" && order.paymentType == 'cash') || (order?.status != "waitPayment" && order.paymentType == 'card')) {
        return next(new Error(`Cannot cancel your order after  it been changed to ${order.status}`, { cause: 400 }))
    }
    const cancelOrder = await orderModel.updateOne({ _id: order._id }, { status: 'canceled', reason, updatedBy: req.user._id })
    if (!cancelOrder.matchedCount) {
        return next(new Error(`Fail to  cancel your order `, { cause: 400 }))
    }

    //   decrease product stock
    for (const product of order.products) { await productModel.updateOne({ _id: product.productId }, { $inc: { stock: parseInt(product.quantity) } }) }
    //push user id in  coupon usedBy
    if (order.couponId) {
        await couponModel.updateOne({ _id: order.couponId }, { $pull: { usedBy: req.user._id } })
    }

    return res.status(200).json({ message: "Done" })
})

export const updateOrderStatusByAdmin = asyncHandler(async (req, res, next) => {

    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderModel.findOne({ _id: orderId })

    if (!order) {
        return next(new Error(`In-valid order Id`, { cause: 404 }))
    }
    const cancelOrder = await orderModel.updateOne({ _id: order._id }, { status, updatedBy: req.user._id })
    if (!cancelOrder.matchedCount) {
        return next(new Error(`Fail to  updated your order `, { cause: 400 }))
    }
    return res.status(200).json({ message: "Done" })
})


export const webhook = asyncHandler(async (req, res) => {

    const stripe = new Stripe(process.env.STRIPE_KEY)
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    const { orderId } = event.data.object.metadata
    if (event.type != 'checkout.session.completed') {
        await orderModel.updateOne({ _id: orderId }, { status: "rejected" });
        return res.status(400).json({ message: "Rejected order" })
    }
    await orderModel.updateOne({ _id: orderId }, { status: "placed" });
    return res.status(200).json({ message: "Done" })
})