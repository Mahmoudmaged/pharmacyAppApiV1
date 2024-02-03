import * as brandController from "./controller/brand.js";
import * as validators from "./brand.validation.js";
import { validation } from "../../middleware/validation.js";
import {
  diskFileUpload,
  fileUpload,
  fileValidation,
} from "../../utils/multer.js";
import { Router } from "express";
import { endPoint } from "./brand.endPoint.js";
import { auth } from "../../middleware/auth.js";
import medicineRouter from "./../medicine/medicine.router.js";
const router = Router();

router.use("/:brandId/medicine", medicineRouter);

router.get("/", brandController.getBrandList);
router.get(
  "/:brandId",
  validation(validators.checkId),
  brandController.getBrandById
);

router.post(
  "/",
  auth(),
  diskFileUpload("brand", fileValidation.image).single("image"),
  validation(validators.createBrand),
  brandController.createBrand
);

router.put(
  "/:brandId",
  auth(),
  diskFileUpload("brand", fileValidation.image).single("image"),
  validation(validators.updateBrand),
  brandController.updateBrand
);

export default router;
