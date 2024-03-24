import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createOrder = joi.object({
  note: joi.string().min(1),
  address: joi
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
    .required(),
  phone: joi
    .array()
    .items(
      joi
        .string()
        .pattern(
          new RegExp(
            /^(002|\+2)?01[0125][0-9]{8}$|^(?:\+?0*?966)?0?(5[0-9]{8})$/
          )
        )
        .required()
    )
    .min(1)
    .max(3)
    .required(),
  couponName: joi.string(),
  paymentType: joi.string().valid("cash", "card"),
  products: joi
    .array()
    .items(
      joi
        .object({
          productId: generalFields.id,
          quantity: joi.number().positive().integer().min(1).required(),
        })
        .required()
    )
    .min(1),
});
