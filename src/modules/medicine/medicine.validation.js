import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createMedicine = joi
  .object({
    name: joi
      .object({
        AR: joi
          .string()
          .pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u))
          .required(),
        EN: joi
          .string()
          .pattern(new RegExp(/[a-zA-Z]{2,25}$/))
          .required(),
      })
      .required(),
    description: joi.object({
      AR: joi
        .string()
        .pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/))
        .required(),
      EN: joi
        .string()
        .pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/))
        .required(),
    }),
    mainPrice: joi.number().required(),
    discountPercent: joi.number().min(0).max(100),
    isDrug: joi.boolean().required(),
    file: joi.array().items(generalFields.file.required()).required(),
    brand: generalFields.id,
    category: generalFields.id,
    sideEffects: joi.array().items(joi.string().required()).required(),
    indicationsForUse: joi.object(), // TODO
    dose: joi.object(), // TODO
  })
  .required();

export const updateMedicine = joi
  .object({
    id: generalFields.id,
    name: joi.object({
      AR: joi.string().pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)),
      EN: joi.string().pattern(new RegExp(/[a-zA-Z]{2,25}$/)),
    }),
    description: joi.object({
      AR: joi
        .string()
        .pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)),
      EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)),
    }),
    mainPrice: joi.number(),
    discountPercent: joi.number().min(0).max(100),
    isDrug: joi.boolean(),
    brand: generalFields.optionalId,
    category: generalFields.optionalId,
    sideEffects: joi.array().items(joi.string().required()),
    indicationsForUse: joi.object(), // TODO
    dose: joi.object(), // TODO
  })
  .required();

export const deleteMedicineImage = joi
  .object({
    id: generalFields.id,
    dest: joi.string().required(),
  })
  .required();

export const addMedicineImage = joi
  .object({
    id: generalFields.id,
    file: generalFields.file,
  })
  .required();

export const deletegetMedicine = joi
  .object({
    id: generalFields.id,
  })
  .required();

export const getMedicines = joi
  .object({
    categoryId: generalFields.optionalId,
    brandId: generalFields.optionalId,
  })
  .required();
