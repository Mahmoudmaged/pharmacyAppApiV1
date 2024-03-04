import * as categoryController from "./controller/category.js";
import * as validators from "./category.validation.js";
import { validation } from "../../middleware/validation.js";
import {
  diskFileUpload,
  fileUpload,
  fileValidation,
  folderNames,
} from "../../utils/multer.js";
import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.js";
import { endPoint } from "./category.endPoint.js";
import medicineRouter from "./../medicine/medicine.router.js";
const router = Router({});

router.use("/:categoryId/medicine", medicineRouter);

router.get("/", categoryController.getCategoryList);

router.get(
  "/:categoryId",
  validation(validators.checkId),
  categoryController.getCategoryById
);

router.post(
  "/",
  authentication(),
  authorization(endPoint.write),
  diskFileUpload(folderNames.category, fileValidation.image).single("image"),
  validation(validators.createCategory),
  categoryController.createCategory
);

router.put(
  "/:categoryId",
  authentication(),
  authorization(endPoint.write),
  diskFileUpload(folderNames.category, fileValidation.image).single("image"),
  validation(validators.updateCategory),
  categoryController.updateCategory
);

router.patch(
  "/:categoryId/addBrand",
  authentication(),
  authorization(endPoint.write),
  validation(validators.addBrandItem),
  categoryController.addBrandItem
);

router.patch(
  "/:categoryId/removeBrand",
  authentication(),
  authorization(endPoint.write),
  validation(validators.addBrandItem),
  categoryController.removeBrandItems
);

router.patch(
  "/:categoryId/delete",
  authentication(),
  authorization(endPoint.write),
  validation(validators.checkId),
  categoryController.deleteCategory
);


router.patch(
  "/:categoryId/unfreeze",
  authentication(),
  authorization(endPoint.write),
  validation(validators.checkId),
  categoryController.unfreeze
);

export default router;
