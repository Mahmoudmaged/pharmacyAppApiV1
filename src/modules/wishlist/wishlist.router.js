import * as wishlistController from "./controller/wishlist.js";
import * as validators from "./wishlist.validation.js";
import { validation } from "../../middleware/validation.js";
import { Router } from "express";
import { endPoint } from "./wishlist.endPoint.js";
import { authentication, authorization } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });

//create
router.post(
  "/",
  authentication(),
  authorization(endPoint.write),
  validation(validators.checkId),
  wishlistController.add
);

//update
router.patch(
  "/remove",
  authentication(),
  authorization(endPoint.write),
  validation(validators.checkId),
  wishlistController.remove
);

//get
router.get(
  "/",
  authentication(),
  authorization(endPoint.read),
  wishlistController.getWishlist
);

export default router;
