import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./medicine.endPoint.js";
import { diskFileUpload, fileValidation, folderNames } from "../../utils/multer.js";
import * as medicineController from "./controller/medicine.js";
import * as validators from "./medicine.validation.js";
import { validation } from "../../middleware/validation.js";
const router = Router({ mergeParams: true });

// add medicine
router.post(
  "/",
  auth(endPoint.write),
  validation(validators.createMedicine),
  medicineController.createMedicine
);

// update medicine info
router.put(
  "/:medicineId",
  auth(endPoint.write),
  validation(validators.updateMedicine),
  medicineController.updateMedicine
);

router.patch(
  "/:medicineId/variant/:variantId",
  auth(endPoint.write),
  validation(validators.updateMedicineVariant),
  medicineController.updateMedicineVariant
);

// freeze/unfreeze medicine variant 
router.patch(
  "/:medicineId/variant/:variantId/freeze",
  auth(endPoint.write),
  validation(validators.deleteMedicineVariant),
  medicineController.freezeMedicineVariant);
router.patch(
  "/:medicineId/variant/:variantId/unfreeze",
  auth(endPoint.write),
  validation(validators.deleteMedicineVariant),
  medicineController.unFreezeMedicineVariant
);



// delete medicine image
router.patch(
  "/:medicineId/image",
  auth(endPoint.write),
  validation(validators.deleteMedicineImage),
  medicineController.deleteMedicineImage
);

// add medicine image
router.post(
  "/:medicineId/image",
  auth(endPoint.write),
  diskFileUpload(folderNames.medicine, fileValidation.image).array("image", 5),
  validation(validators.addMedicineImage),
  medicineController.addMedicineImage
);

// freeze/unfreeze medicine
router.patch(
  "/:medicineId/freeze",
  auth(endPoint.write),
  validation(validators.deleteMedicine),
  medicineController.freezeMedicine
);
router.patch(
  "/:medicineId/unfreeze",
  auth(endPoint.write),
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
