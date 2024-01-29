import * as roleController from './controller/role.js'
import * as validators from './role.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
import { endPoint } from './role.endPoint.js';
import { auth } from '../../middleware/auth.js';
const router = Router()

//get
router.get("/", auth(), roleController.getAll)
router.get("/:roleId", auth(), validation(validators.checkID), roleController.getById)
//create
router.post("/", auth(), validation(validators.createRole), roleController.createRole)
router.put("/:roleId/add", auth(), validation(validators.addRoleItem), roleController.addRoleItem)
//update
router.put("/:roleId", auth(), validation(validators.updateRole), roleController.updateRole)
//delete
router.delete("/:roleId/privilege/:privilegeId", auth(), validation(validators.deleteRoleItem), roleController.deleteRoleItem)
router.delete("/:roleId", auth(), validation(validators.checkID), roleController.deleteRole)

export default router