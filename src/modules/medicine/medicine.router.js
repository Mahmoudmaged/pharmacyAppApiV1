import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import medicineEndPoint from "./medicine.endPoint.js";
import { diskFileUpload, fileValidation } from "../../utils/multer.js";
import * as medicineController from "./controller/medicine.js";
import * as validators from "./medicine.validation.js";
import { validation } from "../../middleware/validation.js";
const router = Router({ mergeParams: true });

// add medicine
router.post(
  "/",
  auth(medicineEndPoint.create),
  // add folder for each medicine "edit multer" // TODO
  diskFileUpload("medicine", fileValidation.image).array("images"),
  validation(validators.createMedicine),
  medicineController.createMedicine
);

// update medicine info
router.patch(
  "/:id",
  auth(medicineEndPoint.update),
  validation(validators.updateMedicine),
  medicineController.updateMedicine
);

// delete medicine image
router.patch(
  "/image/:id",
  auth(medicineEndPoint.update),
  validation(validators.deleteMedicineImage),
  medicineController.deleteMedicineImage
);

// add medicine image
router.post(
  "/image/:id",
  auth(medicineEndPoint.update),
  diskFileUpload("medicine", fileValidation.image).single("image"),
  validation(validators.addMedicineImage),
  medicineController.addMedicineImage
);

// delete medicine
router.delete(
  "/:id",
  auth(medicineEndPoint.delete),
  validation(validators.deletegetMedicine),
  medicineController.deleteMedicine
);

// get all medicines || of category || of brand
router.get(
  "/",
  auth(medicineEndPoint.get),
  validation(validators.getMedicines),
  medicineController.getMedicines
);

// get single medicine
router.get(
  "/:id",
  auth(medicineEndPoint.get),
  validation(validators.deletegetMedicine),
  medicineController.singleMedicine
);

// search medicine

export default router;
