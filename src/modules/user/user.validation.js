import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const profilePic = joi
  .object({
    file: generalFields.file.required(),
  })
  .required();

export const updatePassword = joi
  .object({
    oldPassword: generalFields.password,
    newPassword: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref("newPassword")),
  })
  .required();


export const updateBasicInfo = joi
  .object({
    fullName: joi
      .string()
      .pattern(/^([\u0621-\u064Aa-zA-Z]{2,}\s){2}[\u0621-\u064Aa-zA-Z]{2,}$/),
    phone: joi.array().items(joi.object({
      code: joi.string().pattern(/^(002|\+2)$/).required(),
      number: joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
    }))

    , // egyptian number
    gender: joi.string().valid("male", "female", "ذكر", "انثي"),
    country: joi.string(),
    DOB: joi.string(),
    measurements: joi.object({
      height: joi.number().required(),
      weight: joi.number().required(),
      blood: joi.string().valid('o+', 'o-', 'a+', 'a-', 'B+', 'B-', 'AB+', 'AB-')
    })
  })
  .required();


export const addPhone = joi
  .object({
    phone: joi.object({
      code: joi.string().pattern(/^(002|\+2)$/).required(),
      number: joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
    }).required()
  })
  .required();

export const addAddress = joi
  .object({
    country: joi.string(),
    city: joi.string(),
    gov: joi.string(),
    details: joi.string(),
    location: joi.object({
      lat: joi.number().required(),
      lang: joi.number().required(),
    }),
    mainAddress: joi.boolean()
  })
  .required();

export const updateEmail = joi
  .object({
    email: generalFields.email,
  })
  .required();
export const checkId = joi
  .object({
    addressId: generalFields.id,
  })
  .required();
export const removePhone = joi
  .object({
    phoneId: generalFields.id,
  })
  .required();


export const ChronicDaises = joi
  .object({
    chronicDiseases: joi.array().items(generalFields.id).required(),
  })
  .required();




