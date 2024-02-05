import { auth, roles } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { diskFileUpload, fileValidation } from "../../utils/multer.js";
import * as userController from "./controller/user.js";
import * as userEndpoint from "./user.endPoint.js";
import * as validators from "./user.validation.js";

import { Router } from "express";
const router = Router();

// profile
router.get("/profile", auth(userEndpoint.read), userController.profile);

// profile pic
router.post(
  "/profilePic",
  auth(userEndpoint.create),
  diskFileUpload("user", fileValidation.image).single("image"),
  validation(validators.profilePic),
  userController.profilePic
);

export default router;
