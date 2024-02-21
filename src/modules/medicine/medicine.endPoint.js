import { privileges } from "../../middleware/auth.js";
export const endPoint = {
  read: privileges.readMedicine,
  write: privileges.writeMedicine,
};
