import * as roleController from './controller/role.js'
import * as validators from './role.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
import { endPoint } from './role.endPoint.js';
import { auth } from '../../middleware/auth.js';
const router = Router()

//get
router.get("/", auth(endPoint.read), roleController.getAll)
router.get("/:roleId", auth(endPoint.read), validation(validators.checkID), roleController.getById)
//create
router.post("/", auth(endPoint.write), validation(validators.createRole), roleController.createRole)
router.put("/:roleId/add", auth(endPoint.write), validation(validators.addRoleItem), roleController.addRoleItem)
//update
router.put("/:roleId", auth(endPoint.write), validation(validators.updateRole), roleController.updateRole)
//delete
router.patch("/:roleId/privilege/:privilegeId", auth(endPoint.write), validation(validators.deleteRoleItem), roleController.deleteRoleItem)
router.patch("/:roleId", auth(endPoint.write), validation(validators.checkID), roleController.deleteRole)

export default router