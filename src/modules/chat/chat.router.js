
import { Router } from 'express'
import { authentication, authorization } from "../../middleware/auth.js";

import * as chatController from './controller/chat.js'
const router = Router()



// router.post("/", authentication() , authorization(Object.values(roles)), chatController.sendMessage)
// router.get("/ovo/:destId", auth(Object.values(roles)), chatController.getChat)




export default router