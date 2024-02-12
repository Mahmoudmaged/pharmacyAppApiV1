import {  privileges} from "../../middleware/auth.js";


export const endPoint = {
    write :privileges.writeChronicDisease,
    read :privileges.readChronicDisease,
}