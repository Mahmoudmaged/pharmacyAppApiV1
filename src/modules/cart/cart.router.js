import { authentication, authorization } from '../../middleware/auth.js';

import { endpoint } from './cart.endPoint.js';
import * as cartController from './controller/cart.js'
import { Router } from "express";
const router = Router()




router.post("/",
    authentication(),
    authorization(endpoint.create),
    cartController.createCart)


router.patch("/remove",
    authentication(),
    authorization(endpoint.create),
    cartController.deleteItems)

router.patch("/clear",
    authentication(),
    authorization(endpoint.create),
    cartController.clearCart)




export default router