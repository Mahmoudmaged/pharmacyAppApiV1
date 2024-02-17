import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const getCoupons = joi
  .object({
    onlyValid: joi.boolean(),
  })
  .required();

export const createCoupon = joi
  .object({
    name: joi.string().min(2).max(25).required(),
    description: joi.string(),
    duration: joi.number().required(),
    amount: joi.number().positive().min(1).max(100).required(),
    expire: joi.date().greater(Date.now()).required(),
    file: generalFields.file,
  })
  .required();

export const createCouponImage = joi
  .object({
    couponId: generalFields.id,
    file: generalFields.file,
  })
  .required();

export const deleteCoupon = joi
  .object({
    couponId: generalFields.id,
  })
  .required();

export const updateCoupon = joi
  .object({
    couponId: generalFields.id,
    name: joi.string().min(2).max(25),
    description: joi.string(),
    duration: joi.number(),
    amount: joi.number().positive().min(1).max(100),
    expire: joi.date().greater(Date.now()),
  })
  .required();
