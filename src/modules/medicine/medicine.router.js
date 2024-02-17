import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.js";

import { endPoint } from "./medicine.endPoint.js";
import {
  diskFileUpload,
  fileValidation,
  folderNames,
} from "../../utils/multer.js";
import * as medicineController from "./controller/medicine.js";
import * as validators from "./medicine.validation.js";
import { validation } from "../../middleware/validation.js";
import wishlistRouter from "../wishlist/wishlist.router.js";
const router = Router({ mergeParams: true });
router.use("/:medicineId/wishlist", wishlistRouter);
// add medicine
router.post(
  "/",
  authentication(),
  authorization(endPoint.write),
  validation(validators.createMedicine),
  medicineController.createMedicine
);

// update medicine info
router.put(
  "/:medicineId",
  authentication(),
  authorization(endPoint.write),
  validation(validators.updateMedicine),
  medicineController.updateMedicine
);

router.patch(
  "/:medicineId/variant/:variantId",
  authentication(),
  authorization(endPoint.write),
  validation(validators.updateMedicineVariant),
  medicineController.updateMedicineVariant
);

// freeze/unfreeze medicine variant
router.patch(
  "/:medicineId/variant/:variantId/freeze",
  authentication(),
  authorization(endPoint.write),
  validation(validators.deleteMedicineVariant),
  medicineController.freezeMedicineVariant
);

router.patch(
  "/:medicineId/variant/:variantId/unfreeze",
  authentication(),
  authorization(endPoint.write),
  validation(validators.deleteMedicineVariant),
  medicineController.unFreezeMedicineVariant
);

// delete medicine image
router.patch(
  "/:medicineId/image",
  authentication(),
  authorization(endPoint.write),
  validation(validators.deleteMedicineImage),
  medicineController.deleteMedicineImage
);

// add medicine image
router.post(
  "/:medicineId/image",
  authentication(),
  authorization(endPoint.write),
  diskFileUpload(folderNames.medicine, fileValidation.image).array("image", 5),
  validation(validators.addMedicineImage),
  medicineController.addMedicineImage
);

// freeze/unfreeze medicine
router.patch(
  "/:medicineId/freeze",
  authentication(),
  authorization(endPoint.write),
  validation(validators.deleteMedicine),
  medicineController.freezeMedicine
);
router.patch(
  "/:medicineId/unfreeze",
  authentication(),
  authorization(endPoint.write),
  validation(validators.deleteMedicine),
  medicineController.unFreezeMedicine
);

// get all medicines || of category || of brand
router.get(
  "/",
  validation(validators.getMedicines),
  medicineController.getMedicines
);

// search medicine
router.get(
  "/search",
  validation(validators.searchMedicine),
  medicineController.searchMedicine
);

// get single medicine
router.get(
  "/:medicineId",
  validation(validators.checkId),
  medicineController.singleMedicine
);

export default router;
