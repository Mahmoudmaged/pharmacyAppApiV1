import { roles } from "../../middleware/auth.js";


export const endpoint = {
    createReview: [roles.User],
    updateReview: [roles.User],
}