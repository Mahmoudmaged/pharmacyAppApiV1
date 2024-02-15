import { privileges } from "../../middleware/auth.js";


export const endPoint = {
    write :privileges.writeWishlist,
    read :privileges.readWishlist,
}