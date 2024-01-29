import * as orderController from './controller/order.js'
import * as validators from './order.validation.js'
import express from 'express'
import { validation } from '../../middleware/validation.js';

import { endpoint } from './order.endPoint.js'
import { auth } from '../../middleware/auth.js'
import { Router } from "express";
const router = Router()




router.post('/',
    auth(endpoint.create),
    validation(validators.createOrder),
    orderController.createOrder)

router.patch('/:orderId',
    auth(endpoint.cancelOrder),
    validation(validators.cancelOrder),
    orderController.cancelOrder)

router.patch('/:orderId/admin',
    auth(endpoint.adminUpdateOrder),
    validation(validators.adminUpdateOrder),
    orderController.updateOrderStatusByAdmin)




router.post('/webhook', express.raw({ type: 'application/json' }), orderController.webhook);

export default router