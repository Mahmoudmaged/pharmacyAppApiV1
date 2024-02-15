import * as brandController from "./controller/brand.js";
import * as validators from "./brand.validation.js";
import { validation } from "../../middleware/validation.js";
import {
  diskFileUpload,
  fileUpload,
  fileValidation,
  folderNames,
} from "../../utils/multer.js";
import { Router } from "express";
import { endPoint } from "./brand.endPoint.js";
import { authentication, authorization } from '../../middleware/auth.js';

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
  authentication(),
  authorization(endPoint.write),
  diskFileUpload(folderNames.brand, fileValidation.image).single("image"),
  validation(validators.createBrand),
  brandController.createBrand
);

router.put(
  "/:brandId",
  authentication(),
  authorization(endPoint.write),
  diskFileUpload(folderNames.brand, fileValidation.image).single("image"),
  validation(validators.updateBrand),
  brandController.updateBrand
);

router.patch(
  "/:brandId/delete",
  authentication(),
  authorization(endPoint.write),
  validation(validators.checkId),
  brandController.deleteBrand
);

export default router;
