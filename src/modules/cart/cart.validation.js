import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addToCart = joi.object({
    productId: generalFields.id,
    quantity: joi.number().positive().min(1).required(),
}).required()


export const deleteFromCart = joi.object({
    productIds: joi.array().items(generalFields.id).min(1).required(),
}).required()