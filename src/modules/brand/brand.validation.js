import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const checkId = joi.object({
    brandId: generalFields.id
}).required()

export const createBrand = joi.object({
    name: joi.object({
        AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/)).required()
    }).required(),
    file: generalFields.file.required()
}).required()


export const updateBrand = joi.object({
    brandId: generalFields.id,
    name: joi.object({
        AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/))
    }),
    file: generalFields.file
}).required()