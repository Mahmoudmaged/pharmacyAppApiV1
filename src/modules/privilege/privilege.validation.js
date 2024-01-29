import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const createPrivilege = joi.object({
    title: joi.string().min(2).max(25).required(),
    label: joi.string().required(),
    // actions: joi.array().items(joi.object({
    //     title: joi.string().min(2).max(25).required(),
    // })).min(1).required(),
}).required()

export const updatePrivilege = joi.object({
    id: generalFields.id,
    title: joi.string().min(2).max(25),
    label: joi.string()
}).required()

export const deletePrivilege = joi.object({
    id: generalFields.id
}).required()


