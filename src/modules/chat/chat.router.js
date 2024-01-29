
import { Router } from 'express'
import { roles, auth } from '../../middleware/auth.js'
import * as chatController from './controller/chat.js'
const router = Router()



router.post("/", auth(Object.values(roles)), chatController.sendMessage)
router.get("/ovo/:destId", auth(Object.values(roles)), chatController.getChat)




export default router