
import * as privilegeController from './controller/privilege.js'
import * as validators from './privilege.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.js";

const router = Router()


//create
router.post("/", authentication(), validation(validators.createPrivilege), privilegeController.createPrivilege)
//update
router.put("/:id", authentication(), validation(validators.updatePrivilege), privilegeController.updatePrivilege)
//delete
router.delete("/:id/", authentication(), validation(validators.deletePrivilege), privilegeController.deletePrivilege)
//get
router.get("/", authentication(), privilegeController.getAll)
router.get("/:id", authentication(), validation(validators.deletePrivilege), privilegeController.getById)



// router.put("/:id/add", auth(),  privilegeController.addPrivilegeItem)
// router.put("/:id/item/:itemId", auth(), privilegeController.updatePrivilegeI / tem)


export default router