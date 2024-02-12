import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const checkId = joi.object({
    chronicDiseaseId: generalFields.id
}).required()

export const createChronicDisease= joi.object({
    disease: joi.object({
        AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/)).required()
    }).required()
}).required()


export const updateChronicDisease= joi.object({
    chronicDiseaseId: generalFields.id,
    disease: joi.object({
        AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/))
    })
}).required()

