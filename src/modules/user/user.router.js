import { authentication, authorization } from "../../middleware/auth.js";

import { validation } from "../../middleware/validation.js";
import {
  diskFileUpload,
  fileValidation,
  folderNames,
} from "../../utils/multer.js";
import * as userController from "./controller/user.js";
import { endPoint } from "./user.endPoint.js";
import * as validators from "./user.validation.js";
import { Router } from "express";
const router = Router();

// profile
router.get(
  "/profile",
  authentication(),
  // authorization(endPoint.read),
  userController.profile
);

// profile pic
router.patch(
  "/profile/pic",
  authentication(),
  // authorization(endPoint.write),
  diskFileUpload(folderNames.user, fileValidation.image).single("image"),
  validation(validators.profilePic),
  userController.profilePic
);

router.patch(
  "/profile/password",
  authentication(),
  // authorization(endPoint.write),
  validation(validators.updatePassword),
  userController.updatePassword
);

router.patch(
  "/profile/email",
  authentication(),
  // authorization(endPoint.write),
  validation(validators.updateEmail),
  userController.updateEmail
);

router.patch(
  "/profile/address",
  authentication(),
  validation(validators.addAddress),
  userController.addAddress
);

// location >> // to be completed >> TODO
router.post(
  "/order",
  authentication(),
  // authorization(endPoint.write),
  userController.sendNotification
);

export default router;
