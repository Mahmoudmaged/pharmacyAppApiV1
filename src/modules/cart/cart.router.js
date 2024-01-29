import { auth } from '../../middleware/auth.js';
import { endpoint } from './cart.endPoint.js';
import * as cartController from './controller/cart.js'
import { Router } from "express";
const router = Router()




router.post("/",
    auth(endpoint.create),
    cartController.createCart)


router.patch("/remove",
    auth(endpoint.create),
    cartController.deleteItems)

router.patch("/clear",
    auth(endpoint.create),
    cartController.clearCart)




export default router