import * as pharmacyController from './controller/pharmacy.js'
import * as validators from './pharmacy.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
import { diskFileUpload, fileValidation, folderNames } from '../../utils/multer.js';
import { authentication, authorization } from "../../middleware/auth.js";
import { endPoint } from './pharmacy.endPoint.js';

const router = Router()
router.get('/',
    pharmacyController.pharmacyList
);

router.get('/:pharmacyId/profile',
    validation(validators.checkId),
    pharmacyController.getPharmacy
);


router.post('/signup',
    validation(validators.signup),
    pharmacyController.registerPharmacy
);

router.post('/branch/signup',
    validation(validators.signup),
    authentication(),
    pharmacyController.registerBranchToPharmacy
);

router.put('/:pharmacyId/certificates',
    authentication(),
    diskFileUpload(folderNames.pharmacy, fileValidation.file).fields([
        { name: "license", maxCount: 1, },
        { name: "commercialRegister", maxCount: 1 },
        { name: "taxCard", maxCount: 1 },
    ]),
    validation(validators.certificates),
    pharmacyController.uploadPharmacyFiles
);

router.patch('/:pharmacyId/image',
    authentication(),
    diskFileUpload(folderNames.pharmacy, fileValidation.image).single("image"),
    validation(validators.image),
    pharmacyController.pharmacyImage
);

router.patch('/:pharmacyId/employee/:employeeId/hire',
    validation(validators.hireEmployee),
    authentication(),
    pharmacyController.hireEmployee
);

router.patch('/:pharmacyId/employee/:employeeId/fire',
    validation(validators.hireEmployee),
    authentication(),
    pharmacyController.fireEmployee
);


router.put('/:pharmacyId/request/approve',
    validation(validators.approvePharmacy),
    authentication(),
    authorization(endPoint.approvePharmacy),
    pharmacyController.approvePharmacy
);

router.post('/login', validation(validators.login), pharmacyController.PharmacyLogin)

router.post('/employee/login', validation(validators.employeeLogin), pharmacyController.pharmacyEmployeeLogin)


router.post('/confirmEmail', validation(validators.confirmEmail), pharmacyController.confirmPharmacyEmail)
router.post('/newConfirmEmail', validation(validators.newConfirmEmail), pharmacyController.requestNewPharmacyConfirmEmail)

router.patch("/sendForgetCode",
    validation(validators.sendForgetCode),
    pharmacyController.sendForgetCodeToPharmacy)

router.patch("/forgetPassword",
    validation(validators.forgetPassword),
    pharmacyController.forgetPasswordToPharmacy)



//////////////// Settings

//update basicInfo
router.put(
    "/:pharmacyId/profile/info",
    authentication(),
    validation(validators.updatePharmacyBasicInfo),
    pharmacyController.updatePharmacyBasicInfo
)

// //updatePassword 
router.patch(
    "/:pharmacyId/profile/password",
    authentication(),
    // authorization(endPoint.write),
    validation(validators.updatePassword),
    pharmacyController.updatePassword
);
//updateEmail
router.patch(
    "/:pharmacyId/profile/email",
    authentication(),
    // authorization(endPoint.write),
    validation(validators.updateEmail),
    pharmacyController.updateEmail
);


//add phone
router.patch(
    "/:pharmacyId/profile/phone/add",
    authentication(),
    // authorization(endPoint.write),
    validation(validators.addPhone),
    pharmacyController.addPhone
);

//delete phone
router.patch(
    "/:pharmacyId/profile/phone/delete",
    authentication(),
    // authorization(endPoint.write),
    validation(validators.deletePhone),
    pharmacyController.deletePhone
);


//delete phone
router.patch(
    "/:pharmacyId/profile/phone/:phoneId/markAsMain",
    authentication(),
    // authorization(endPoint.write),
    validation(validators.markAsMainPhone),
    pharmacyController.markAsMainPhone
);


export default router