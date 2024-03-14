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
    cPassword: generalFields.cPassword.valid(joi.ref('newPassword')),
  })
  .required();



export const updateEmail = joi
  .object({
    email: generalFields.email
  })
  .required();