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

// confirm dummy order
router.patch(
  "/confirm/:orderId",
  authentication(),
  // authorization(endPoint.createOrder),
  validation(validators.confirmDummyOrder),
  orderController.confirmDummyOrder
);

// get user orders by client
router.get(
  "/",
  authentication(),
  validation(validators.allOrders),
  orderController.allUserOrders
);

// get user orders by admins
router.get(
  "/admin",
  authentication(),
  validation(validators.allOrders),
  orderController.allOrders
);

// single order
router.get(
  "/:orderId",
  authentication(),
  // authorization(endPoint.create),
  validation(validators.singleOrder),
  orderController.singleOrder
);

// update status
router.patch(
  "/:orderId/admin",
  authentication(),
  // authorization(endpoint.create),
  validation(validators.updateOrderStatusByAdmin),
  orderController.updateOrderStatusByAdmin
);

export default router;
