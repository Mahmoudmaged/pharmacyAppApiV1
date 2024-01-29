import * as authController from './controller/registration.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import * as validators from './auth.validation.js'
import { auth } from '../../middleware/auth.js';
const router = Router()


router.post('/pre/signup', validation(validators.preSignup), authController.preSignup)
router.post('/signup', validation(validators.signup), authController.completeSignup)
router.post('/loginWithGmail', authController.loginWithGmail)

router.post('/confirmEmail', validation(validators.confirmEmail), authController.confirmEmail)
router.post('/newConfirmEmail', validation(validators.newConfirmEmail), authController.requestNewConfirmEmail)


router.post('/login', validation(validators.login), authController.login)

router.patch("/sendForgetCode",
    validation(validators.sendForgetCode),
    authController.sendForgetCode)

router.patch("/forgetPassword",
    validation(validators.forgetPassword),
    authController.forgetPassword)

router.post("/newToken",
    validation(validators.requestNewAccessToken),
    authController.requestNewAccessToken)



router.post('/registerAdmin', auth('createAdmin'), validation(validators.registerAdmin), authController.registerAdmin)

export default router