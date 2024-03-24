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
  })
  .required();

export const updateEmail = joi
  .object({
    email: generalFields.email,
  })
  .required();
