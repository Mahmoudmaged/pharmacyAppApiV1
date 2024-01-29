import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const checkID = joi.object({
    roleId: generalFields.id,

}).required()
export const createRole = joi.object({
    title: joi.string().min(2).max(25).required(),
    privileges: joi.array().items(generalFields.id).min(1).required(),
}).required()


export const addRoleItem = joi.object({
    roleId: generalFields.id,
    privileges: joi.array().items(generalFields.id),
}).required()

export const updateRole = joi.object({
    roleId: generalFields.id,
    title: joi.string().min(2).max(25),
    privileges: joi.array().items(generalFields.id),
}).required()


export const deleteRoleItem = joi.object({
    roleId: generalFields.id,
    privilegeId: generalFields.id,

}).required()

