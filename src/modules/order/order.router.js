import * as orderController from "./controller/order.js";
import * as validators from "./order.validation.js";
import express from "express";
import { validation } from "../../middleware/validation.js";

import { endPoint } from "./order.endPoint.js";
import { authentication, authorization } from "../../middleware/auth.js";

import { Router } from "express";
import {
  diskFileUpload,
  fileValidation,
  folderNames,
} from "./../../utils/multer.js";
const router = Router();

// create order from cart
router.post(
  "/",
  authentication(),
  // authorization(endPoint.createOrder),
  diskFileUpload(folderNames.prescription, fileValidation.image).single(
    "image"
  ),
  validation(validators.createOrder),
  orderController.createOrder
);

// accept dummy order
router.patch(
  "/accept/:orderId",
  authentication(),
  // authorization(endPoint.createOrder),
  validation(validators.confirmDummyOrder),
  orderController.confirmDummyOrder
);

// get orders
router.get("/", authentication(), orderController.allOrders);
router.patch(
  "/:orderId",
  authentication(),
  // authorization(endPoint.create),
  validation(validators.cancelOrder),
  orderController.cancelOrder
);

router.patch(
  "/:orderId/admin",
  authentication(),
  // authorization(endpoint.create),
  validation(validators.adminUpdateOrder),
  orderController.updateOrderStatusByAdmin
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  orderController.webhook
);

export default router;
