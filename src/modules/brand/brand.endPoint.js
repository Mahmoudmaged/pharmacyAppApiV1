import {  privileges} from "../../middleware/auth.js";


export const endPoint = {
    write :privileges.writeBrand,
    read :privileges.readBrand,
}