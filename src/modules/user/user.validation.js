import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const profilePic = joi
  .object({
    file: generalFields.file.required(),
  })
  .required();
