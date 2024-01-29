
import * as privilegeController from './controller/privilege.js'
import * as validators from './privilege.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
import { endPoint } from './privilege.endPoint.js';
import { auth } from '../../middleware/auth.js';
const router = Router()


//create
router.post("/", auth(), validation(validators.createPrivilege), privilegeController.createPrivilege)
//update
router.put("/:id", auth(), validation(validators.updatePrivilege), privilegeController.updatePrivilege)
//delete
router.delete("/:id/", auth(), validation(validators.deletePrivilege), privilegeController.deletePrivilege)
//get
router.get("/", auth(), privilegeController.getAll)
router.get("/:id", auth(), validation(validators.deletePrivilege), privilegeController.getById)



// router.put("/:id/add", auth(),  privilegeController.addPrivilegeItem)
// router.put("/:id/item/:itemId", auth(), privilegeController.updatePrivilegeI / tem)


export default router