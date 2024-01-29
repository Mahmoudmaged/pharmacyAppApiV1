
import * as categoryController from './controller/category.js'
import * as validators from './category.validation.js'
import { validation } from '../../middleware/validation.js';
import { diskFileUpload, fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { auth, roles } from '../../middleware/auth.js';
import { endPoint } from './category.endPoint.js';
const router = Router({})


router.get("/",
    categoryController.getCategoryList
)

router.get("/:categoryId",
    validation(validators.checkId),
    categoryController.getCategoryById
)

router.post("/",
    auth('createCategory'),
    diskFileUpload('category', fileValidation.image).single('image'),
    validation(validators.createCategory),
    categoryController.createCategory
)



router.put("/:categoryId",
    auth(endPoint.update),
    fileUpload(fileValidation.image).single('image'),
    validation(validators.updateCategory),
    categoryController.updateCategory
)


router.patch("/:categoryId/addBrand",
    auth(endPoint.update),
    validation(validators.addBrandItem),
    categoryController.addBrandItem
)


router.patch("/:categoryId/removeBrand",
    auth(endPoint.update),
    validation(validators.addBrandItem),
    categoryController.removeBrandItems
)

export default router