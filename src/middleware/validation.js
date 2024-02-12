import joi from "joi";
import { Types } from "mongoose";
export const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("In-valid objectId");
};
export const generalFields = {
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .required(),
  cPassword: joi.string().required(),
  id: joi.string().custom(validateObjectId).required(),
  optionalId: joi.string().custom(validateObjectId),

  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
    dest: joi.string(),
    uniqueFolder: joi.string(),
  }),

  headers: joi.string().required(),
};

export const validation = (schema, considerHeaders = false) => {
  return (req, res, next) => {
    const lang = req.headers.lang || "EN";

    let inputsData = { ...req.body, ...req.query, ...req.params };
    if (req.file || req.files) {
      inputsData.file = req.file || req.files;
    }

    if (req.headers.authorization && considerHeaders) {
      inputsData = { authorization: req.headers.authorization };
    }

    const validationResult = schema.validate(inputsData, { abortEarly: false });
    if (validationResult.error?.details) {
      return res.status(400).json({
        errorMessage: lang == "EN" ? "Validation Err" : "خطاء في بيانات المدخله",
        customCode: 999,
        validationErr: validationResult.error.details,
      });
    }
    return next();
  };
};

export const graphValidation = async (schema, inputsData) => {
  const { error } = schema.validate(inputsData, { abortEarly: false });
  if (error) {
    throw new Error(error);
  }
  return true;
};
