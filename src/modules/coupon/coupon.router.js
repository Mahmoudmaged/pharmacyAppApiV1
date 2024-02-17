import * as couponController from "./controller/coupon.js";
import * as validators from "./coupon.validation.js";
import { validation } from "../../middleware/validation.js";
import {
  diskFileUpload,
  fileValidation,
  folderNames,
} from "../../utils/multer.js";
import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.js";
import { endPoint } from "./coupon.endPoint.js";
const router = Router();

// read
router.get(
  "/",
  authentication(),
  authorization(endPoint.read),
  validation(validators.getCoupons),
  couponController.getCoupon
);

// create coupon
router.post(
  "/",
  authentication(),
  authorization(endPoint.create),
  validation(validators.createCoupon),
  couponController.createCoupon
);

// create coupon image
router.post(
  "/:couponId/image",
  authentication(),
  authorization(endPoint.create),
  diskFileUpload(folderNames.coupon, fileValidation.image).single("image"),
  validation(validators.createCouponImage),
  couponController.createCouponImage
);

// delete coupon image
router.patch(
  "/:couponId/image",
  authentication(),
  authorization(endPoint.create),
  validation(validators.deleteCoupon),
  couponController.deleteCouponImage
);

// update
router.put(
  "/:couponId",
  authentication(),
  authorization(endPoint.create),
  validation(validators.updateCoupon),
  couponController.updateCoupon
);

// delete
router.delete(
  "/:couponId",
  authentication(),
  authorization(endPoint.create),
  validation(validators.deleteCoupon),
  couponController.deleteCoupon
);

export default router;
