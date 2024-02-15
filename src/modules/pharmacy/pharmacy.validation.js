import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const token = joi.object({ token: joi.string().required() }).required()


export const signup = joi.object({
    name: joi.object({
        AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/)).required()
    }).required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('password')),
    phone: joi.string().pattern(/^(002|\+2) 01[0125][0-9]{8}$/).required(),

    address: joi.object({
        country: joi.string().required(),
        city: joi.string().required(),
        gov: joi.string().required(),
        details: joi.string().required(),
        location: joi.object({
            lat: joi.string().required(),
            lang: joi.string().required(),
        }).required(),
    }).required()
}).required()

export const certificates = joi.object({
    imageFolderName: joi.string().required(),
    pharmacyId: generalFields.id,
    file: joi.object({
        license: generalFields.file,
        commercialRegister: generalFields.file,
        taxCard: generalFields.file
    })
}).required()
export const image = joi.object({
    pharmacyId: generalFields.id,
    imageFolderName: joi.string().required(),
    file: generalFields.file.required()
}).required()

export const hireEmployee = joi.object({
    pharmacyId: generalFields.id,
    employeeId: generalFields.id
}).required()

export const approvePharmacy = joi.object({
    pharmacyId: generalFields.id
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

export const employeeLogin = joi.object({
    pharmacyEmail: generalFields.email,
    employeeEmail: generalFields.email,
    employeePassword: generalFields.password
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
    country: joi.string().required(),
    /*regex pattern that accepts a full name consisting of three names, where each name is separated by a space,
    and each name must be at least 2 characters long, accommodating both Arabic and English characters*/
    email: generalFields.email,
    fullName: joi.string().pattern(/^([\u0621-\u064Aa-zA-Z]{2,}\s){2}[\u0621-\u064Aa-zA-Z]{2,}$/).required(),
    phone: joi.string().pattern(/^(002|\+2) 01[0125][0-9]{8}$/).required(),// egyptian number
    gender: joi.string().valid('male', 'female').required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref('password')),
    chronicDiseases: joi.array().items(generalFields.id)

}).required()
