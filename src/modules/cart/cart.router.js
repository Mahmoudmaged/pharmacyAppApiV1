import { authentication, authorization } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';

import { endpoint } from './cart.endPoint.js';
import * as cartController from './controller/cart.js'
import * as validators from './cart.validation.js'
import { Router } from "express";
const router = Router()

router.get("/",
    authentication(),
    // authorization(endpoint.create),
    cartController.getCartData)



router.post("/",
    authentication(),
    // authorization(endpoint.create),
    validation(validators.addToCart),
    cartController.createCart)


router.patch("/remove",
    authentication(),
    // authorization(endpoint.create),
    validation(validators.deleteFromCart),
    cartController.deleteItems)

router.patch("/clear",
    authentication(),
    // authorization(endpoint.create),
    cartController.clearCart)




export default router