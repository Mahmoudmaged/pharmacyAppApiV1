
import * as couponController from './controller/coupon.js'
import * as validators from './coupon.validation.js'
import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.js";

import { endPoint } from './coupon.endPoint.js';
const router = Router()



router.get("/",
    couponController.getCoupon
)

router.post("/",
    authentication(),
    authorization(endPoint.create),
    fileUpload(fileValidation.image).single('image'),
    validation(validators.createCoupon),
    couponController.createCoupon
)



router.put("/:couponId",
    authentication(),
    authorization(endPoint.create),
    fileUpload(fileValidation.image).single('image'),
    validation(validators.updateCoupon),
    couponController.updateCoupon
)

export default router