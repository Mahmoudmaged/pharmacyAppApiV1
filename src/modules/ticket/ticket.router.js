import { authentication, authorization } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import {
  diskFileUpload,
  fileValidation,
  folderNames,
} from "../../utils/multer.js";
import * as ticketController from "./controller/ticket.js";
import * as validators from "./ticket.validation.js";
import { Router } from "express";
const router = Router();

router.post(
  "/text",
  authentication(),
  validation(validators.openTicketText),
  ticketController.openTicketText
);

router.post(
  "/file",
  authentication(),
  diskFileUpload(folderNames.ticket, fileValidation.image).single("image"),
  validation(validators.openTicketFile),
  ticketController.openTicketFile
);

router.post(
  "/order/:ticketId",
  authentication(),
  validation(validators.ticketToOrder),
  ticketController.ticketToOrder
);

export default router;
