import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const checkId = joi.object({
  medicineId: generalFields.id
}).required()

export const searchMedicine = joi.object({
  keyword: joi.string().required()
}).required()

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
    // file: joi.array().items(generalFields.file.required()).max(5).required(),

    brand: generalFields.id,
    category: generalFields.id,

    sideEffects: joi.array().items(
      joi.object({
        AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)).required(),
      }).required()
    ).required(),
    indicationsForUse: joi.array().items(
      joi.object({
        AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)).required(),
      })
    ),
    dose: joi.array().items(
      joi.object({
        startAge: joi.number().min(0).required(),
        endAge: joi.number().greater(joi.ref("startAge")).required(),
        dose: joi.object({
          AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)).required(),
          EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)).required(),
        })
      })
    ),

    variants: joi.array().items(joi.object({
      size: joi.string(),
      color: joi.string()
    }))

  })
  .required();

export const updateMedicine = joi.object({
  medicineId: generalFields.id,

  name: joi.object({
    AR: joi
      .string()
      .pattern(new RegExp(/^[ ؀-ۿـ]{2,25}$/u)),
    EN: joi
      .string()
      .pattern(new RegExp(/[a-zA-Z]{2,25}$/)),
  }),
  description: joi.object({
    AR: joi
      .string()
      .pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)),
    EN: joi
      .string()
      .pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)),
  }),

  mainPrice: joi.number(),
  discountPercent: joi.number().min(0).max(100),
  isDrug: joi.boolean(),

  brand: generalFields.optionalId,
  category: generalFields.optionalId,

  sideEffects: joi.array().items(
    joi.object({
      AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)).required(),
      EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)).required(),
    }).required()
  ),
  indicationsForUse: joi.array().items(
    joi.object({
      AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)).required(),
      EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)).required(),
    })
  ),
  dose: joi.array().items(
    joi.object({
      startAge: joi.number().min(0).required(),
      endAge: joi.number().greater(joi.ref("startAge")).required(),
      dose: joi.object({
        AR: joi.string().pattern(new RegExp(/^[\u0621-\u064A\u0660-\u0669 0-9]{2,2000}/)).required(),
        EN: joi.string().pattern(new RegExp(/[a-zA-Z0-9]{2,2000}$/)).required(),
      })
    })
  ),

  // variants: joi.array().items(joi.object({
  //   size: joi.string(),
  //   color: joi.string()
  // }))

}).required();


export const updateMedicineVariant = joi.object({
  medicineId: generalFields.id,
  variantId: generalFields.id,
  size: joi.string(),
  color: joi.string()

}).required();

export const deleteMedicineVariant = joi.object({
  medicineId: generalFields.id,
  variantId: generalFields.id
}).required();

export const deleteMedicineImage = joi
  .object({
    medicineId: generalFields.id,
    dest: joi.string().required(),
  })
  .required();

export const addMedicineImage = joi
  .object({
    imageFolderName: joi.string().required(),
    medicineId: generalFields.id,
    file: joi.array().items(generalFields.file.required()).max(5).required(),

  })
  .required();

export const deleteMedicine = joi
  .object({
    medicineId: generalFields.id,
  })
  .required();

export const getMedicines = joi
  .object({
    categoryId: generalFields.optionalId,
    brandId: generalFields.optionalId,
  })
  .required();
