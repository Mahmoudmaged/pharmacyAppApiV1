import { privileges } from "../../middleware/auth.js";

export const endPoint = {
  createOrder: privileges.createOrder,
};
