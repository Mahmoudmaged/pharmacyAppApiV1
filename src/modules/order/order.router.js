import * as orderController from './controller/order.js'
import * as validators from './order.validation.js'
import express from 'express'
import { validation } from '../../middleware/validation.js';

import { endpoint } from './order.endPoint.js'
import { authentication, authorization } from "../../middleware/auth.js";

import { Router } from "express";
const router = Router()




router.post('/',
    authentication(),
    authorization(endpoint.create),
    validation(validators.createOrder),
    orderController.createOrder)

router.patch('/:orderId',
    authentication(),
    authorization(endpoint.create),
    validation(validators.cancelOrder),
    orderController.cancelOrder)

router.patch('/:orderId/admin',
    authentication(),
    authorization(endpoint.create),
    validation(validators.adminUpdateOrder),
    orderController.updateOrderStatusByAdmin)




router.post('/webhook', express.raw({ type: 'application/json' }), orderController.webhook);

export default router