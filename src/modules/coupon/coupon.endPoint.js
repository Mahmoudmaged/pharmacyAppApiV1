import { privileges } from "../../middleware/auth.js";

export const endPoint = {
  write: privileges.writeCoupon,
  read: privileges.readCoupon,
};
