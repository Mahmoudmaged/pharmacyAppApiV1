import * as roleController from './controller/role.js'
import * as validators from './role.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
import { endPoint } from './role.endPoint.js';
import { authentication, authorization } from "../../middleware/auth.js";

const router = Router()

//get
router.get("/", authentication(), authorization(endPoint.read), roleController.getAll)
router.get("/:roleId", authentication(), authorization(endPoint.read), validation(validators.checkID), roleController.getById)
//create
router.post("/", authentication(), authorization(endPoint.write), validation(validators.createRole), roleController.createRole)
router.put("/:roleId/add", authentication(), authorization(endPoint.write), validation(validators.addRoleItem), roleController.addRoleItem)
//update
router.put("/:roleId", authentication(), authorization(endPoint.write), validation(validators.updateRole), roleController.updateRole)
//delete
router.patch("/:roleId/privilege/:privilegeId", authentication(), authorization(endPoint.write), validation(validators.deleteRoleItem), roleController.deleteRoleItem)
router.patch("/:roleId", authentication(), authorization(endPoint.write), validation(validators.checkID), roleController.deleteRole)

export default router