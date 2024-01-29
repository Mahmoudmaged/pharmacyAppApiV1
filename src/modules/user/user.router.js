import { auth, roles } from '../../middleware/auth.js';
import * as userController from './controller/user.js'
import { Router } from "express";
const router = Router()




router.get('/', auth(Object.values(roles)), userController.userList)



export default router