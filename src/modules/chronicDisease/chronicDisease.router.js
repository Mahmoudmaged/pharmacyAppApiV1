import * as chronicDiseaseController from "./controller/chronicDisease.js";
import * as validators from "./chronicDisease.validation.js";
import { validation } from "../../middleware/validation.js";
import { Router } from "express";
import { endPoint } from "./chronicDisease.endPoint.js";
import { auth } from "../../middleware/auth.js";
const router = Router();


router.get("/", chronicDiseaseController.getChronicDiseaseList);
router.get(
  "/:chronicDiseaseId",
  validation(validators.checkId),
  chronicDiseaseController.getChronicDiseaseById
);

router.post(
  "/",
  auth(endPoint.write),
  validation(validators.createChronicDisease),
  chronicDiseaseController.createChronicDisease
);

router.put(
  "/:chronicDiseaseId",
  auth(endPoint.write),
  validation(validators.updateChronicDisease),
  chronicDiseaseController.updateChronicDisease
);

router.patch(
  "/:chronicDiseaseId/delete",
  auth(endPoint.write),
  validation(validators.checkId),
  chronicDiseaseController.deleteChronicDisease
);

export default router;
