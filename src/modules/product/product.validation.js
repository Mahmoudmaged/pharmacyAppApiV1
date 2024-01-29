import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const headers = joi.object({
    authorization: generalFields.headers
}).required()
export const createProduct = joi.object({

    name: joi.string().min(2).max(150).required(),
    description: joi.string().min(2).max(150000),
    size: joi.array(),
    colors: joi.array(),
    stock: joi.number().integer().positive().min(1).required(),
    price: joi.number().positive().min(1).required(),
    discount: joi.number().positive().min(1),

    categoryId: generalFields.id,
    subcategoryId: generalFields.id,
    brandId: generalFields.id,

    file: joi.object({
        mainImage: joi.array().items(generalFields.file.required()).length(1).required(),
        subImages: joi.array().items(generalFields.file).min(1).max(5),
    }).required()



}).required()


export const wishlist = joi.object({
    productId: generalFields.id
}).required()

export const updateProduct = joi.object({

    name: joi.string().min(2).max(150),
    description: joi.string().min(2).max(150000),
    size: joi.array(),
    colors: joi.array(),
    stock: joi.number().integer().positive().min(1),
    price: joi.number().positive().min(1),
    discount: joi.number().positive().min(1),

    productId: generalFields.id,
    categoryId: generalFields.optionalId,
    subcategoryId: generalFields.optionalId,
    brandId: generalFields.optionalId,

    file: joi.object({
        mainImage: joi.array().items(generalFields.file.required()).max(1),
        subImages: joi.array().items(generalFields.file).min(1).max(5),
    }).required()



}).required()



export const updateStock = joi.object({
    id: generalFields.id,
    stock:joi.number().positive().integer().min(1).required(),
    authorization:joi.string().required()
}).required()