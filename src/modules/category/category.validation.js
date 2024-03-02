import joi from 'joi'
import { generalFields, validateObjectId } from '../../middleware/validation.js'

export const checkId = joi.object({
    categoryId: generalFields.id
}).required()

export const createCategory = joi.object({
    name: joi.object({
        AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/)).required()
    }).required(),
    description: joi.object({
        AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)).required()
    }),
    // brandIds: joi.array().items(joi.string().custom(validateObjectId)) ssss,
    brandIds: joi.string(),
    file: generalFields.file.required()
}).required()


export const updateCategory = joi.object({
    imageFolderName:joi.string(),
    categoryId: generalFields.id,
    name: joi.object({
        AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/))
    }),
    description: joi.object({
        AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/))
    }),
    // brandIds: joi.array().items(joi.string().custom(validateObjectId)),
    brandIds: joi.string(),
    file: generalFields.file
}).required()



export const addBrandItem = joi.object({
    categoryId:generalFields.id,
    brandIds: joi.array().items(generalFields.id).min(1),

}).required()