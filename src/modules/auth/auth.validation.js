import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const token = joi.object({ token: joi.string().required() }).required()

export const preSignup = joi.object({
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('password')),
}).required()

export const signup = joi.object({
    /*regex pattern that accepts a full name consisting of three names, where each name is separated by a space,
    and each name must be at least 2 characters long, accommodating both Arabic and English characters*/
    fullName: joi.string().pattern(/^([\u0621-\u064Aa-zA-Z]{2,}\s){2}[\u0621-\u064Aa-zA-Z]{2,}$/).required(),
    phone: joi.string().pattern(/^(002|\+2) 01[0125][0-9]{8}$/).required(),// egyptian number
    gender: joi.string().valid('male', 'female', 'ذكر', 'انثي').required(),
    country:joi.string().required(),
    email: generalFields.email,
    chronicDiseases:joi.array().items(generalFields.id)
}).required()

export const confirmEmail = joi.object({
    code: joi.string().pattern(new RegExp(/^[0-9]{4}$/)).required(),
    email: generalFields.email,
}).required()

export const newConfirmEmail = joi.object({
    email: generalFields.email,
}).required()

export const login = joi.object({
    email: generalFields.email,
    password: generalFields.password
}).required()

export const sendForgetCode = joi.object({
    email: generalFields.email,
}).required()


export const forgetPassword = joi.object({
    forgetCode: joi.string().pattern(new RegExp(/^[0-9]{4}$/)).required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('password')),
}).required()


export const requestNewAccessToken = joi.object({
    token: joi.string().required()
}).required()



export const registerAdmin = joi.object({
    country:joi.string().required(),
    /*regex pattern that accepts a full name consisting of three names, where each name is separated by a space,
    and each name must be at least 2 characters long, accommodating both Arabic and English characters*/
    email: generalFields.email,
    fullName: joi.string().pattern(/^([\u0621-\u064Aa-zA-Z]{2,}\s){2}[\u0621-\u064Aa-zA-Z]{2,}$/).required(),
    phone: joi.string().pattern(/^(002|\+2) 01[0125][0-9]{8}$/).required(),// egyptian number
    gender: joi.string().valid('male', 'female').required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('password')),
    chronicDiseases:joi.array().items(generalFields.id)

}).required()
