import { privileges} from "../../middleware/auth.js";


export const endPoint = {
    read :privileges.readRole,
    write :privileges.writeRole
}