import orderModel from "../../../../DB/model/Order.model.js";
import reviewModel from "../../../../DB/model/Review.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";



export const createReview = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { comment, rating } = req.body;
    const order = await orderModel.findOne({
        userId: req.user._id,
        status: 'delivered',
        "products.productId": productId

    })
    if (!order) {
        return next(new Error(`Can not review product before receive it`, { cause: 400 }))
    }

    if (await reviewModel.findOne({ createdBy: req.user._id, productId, orderId: order._id })) {
        return next(new Error(`Already reviewed by you`, { cause: 400 }))
    }
    await reviewModel.create({
        comment,
        rating,
        createdBy: req.user._id,
        orderId: order._id,
        productId
    })
    return res.status(201).json({ message: "Done" })
})


export const updateReview = asyncHandler(async (req, res, next) => {
    const { productId, reviewId } = req.params;
    await reviewModel.updateOne({ _id: reviewId, productId }, req.body)
    return res.status(201).json({ message: "Done" })
})