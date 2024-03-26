import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const openTicketText = joi
  .object({ text: joi.string().required() })
  .required();

export const openTicketFile = joi
  .object({ file: generalFields.file.required() })
  .required();

export const ticketToDummyOrder = joi
  .object({
    ticketId: generalFields.id,
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
  })
  .required();
