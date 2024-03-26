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
// update profile basic info
router.put(
  "/profile",
  authentication(),
  // authorization(endPoint.read),
  validation(validators.updateBasicInfo),

  userController.updateBasicInfo
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

//updatePassword
router.patch(
  "/profile/password",
  authentication(),
  // authorization(endPoint.write),
  validation(validators.updatePassword),
  userController.updatePassword
);
//updateEmail
router.patch(
  "/profile/email",
  authentication(),
  // authorization(endPoint.write),
  validation(validators.updateEmail),
  userController.updateEmail
);

//add address
router.patch(
  "/profile/address",
  authentication(),
  validation(validators.addAddress),
  userController.addAddress
);

//delete address
router.patch(
  "/profile/address/:addressId/delete",
  authentication(),
  validation(validators.checkId),
  userController.deleteAddress
);

// markAsMainAddress as main address
router.patch(
  "/profile/address/:addressId/main",
  authentication(),
  validation(validators.checkId),
  userController.markAsMainAddress
);


// add phone number
router.patch(
  "/profile/phone/add",
  authentication(),
  validation(validators.addPhone),
  userController.addPhone
);



// remove phone number
router.patch(
  "/profile/phone/:phoneId/delete",
  authentication(),
  validation(validators.removePhone),
  userController.removePhone
);




// add addChronicDaises 
router.patch(
  "/profile/chronicDaises/add",
  authentication(),
  validation(validators.ChronicDaises),
  userController.addChronicDaises
);



// remove addChronicDaises 
router.patch(
  "/profile/chronicDaises/delete",
  authentication(),
  validation(validators.ChronicDaises),
  userController.removeChronicDaises
);


// add addChronicDaises 
router.patch(
  "/profile/chronicDaises/add",
  authentication(),
  validation(validators.ChronicDaises),
  userController.addChronicDaises
);



// remove addChronicDaises 
router.patch(
  "/profile/chronicDaises/delete",
  authentication(),
  validation(validators.ChronicDaises),
  userController.removeChronicDaises
);


// location >> // to be completed >> TODO
router.post(
  "/order",
  authentication(),
  // authorization(endPoint.write),
  userController.sendNotification
);

export default router;
