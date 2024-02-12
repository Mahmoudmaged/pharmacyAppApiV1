import { roles , privileges } from "../../middleware/auth.js";
export const endPoint = {
  read: privileges.readCategory,
  write: privileges.writeCategory,
};
