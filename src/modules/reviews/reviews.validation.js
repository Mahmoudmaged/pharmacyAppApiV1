import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const createReview = joi.object({
    productId: generalFields.id,
    comment: joi.string().required().min(2).max(15000),
    rating: joi.number().positive().min(1).max(5).required()
}).required()

export const updateReview = joi.object({
    productId: generalFields.id,
    reviewId: generalFields.id,
    comment: joi.string().min(2).max(15000),
    rating: joi.number().positive().min(1).max(5)
}).required()