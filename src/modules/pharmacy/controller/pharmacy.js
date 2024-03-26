import roleModel from "../../../../DB/model/Role.model.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/GenerateAndVerifyToken.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { nanoid, customAlphabet } from "nanoid";
import { OAuth2Client } from "google-auth-library";
import ChronicDiseaseModel from "../../../../DB/model/ChronicDisease.model.js";
import pharmacyModel from "../../../../DB/model/Pharmacy.model.js";
import { handelConfirmCode } from "../../auth/controller/registration.js";
import _ from "underscore";
import fs from "fs";
import path from "path";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "url";
import PharmacyRequestModel from "../../../../DB/model/PharmacyRequest.model.js";
import userModel from "../../../../DB/model/User.model.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
//pharmacy list   //Done
export const pharmacyList = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const pharmacies = await pharmacyModel.find().populate("headquarter");
  return res
    .json({ message: lang == "EN" ? "Done" : "تم", pharmacies });
});


//pharmacy by id   //Done
export const getPharmacy = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const pharmacy = await pharmacyModel.findById(req.params.pharmacyId).populate("headquarter");
  return res
    .json({ message: lang == "EN" ? "Done" : "تم   ", pharmacy });
});

//////////////////////////////////////////////////Registration process//////////////////////////////////////////////////////////
//signup pharmacy   //Done
export const registerPharmacy = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { name, email, phone, password, address } = req.body;

  //check email exist
  if (await pharmacyModel.findOne({ email: email })) {
    return next(
      new Error(
        lang == "EN"
          ? "Email exist"
          : "عفوا يوجد حساب مسجل يحمل هذا البريد الالكتروني  بالفعل",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }
  //sendEmail()
  const hashConfirmCode = await handelConfirmCode({ req, email });
  //hashPassword
  const hashPassword = hash({ plaintext: password });
  // create pharmacy
  const { _id } = await pharmacyModel.create({
    name,
    email,
    phone: [
      {
        code: phone.split(" ")[0],
        number: phone.split(" ")[1],
        mainNumber: true,
      },
    ],
    country: address.country,
    address,
    imageFolderName: nanoid(),
    password: hashPassword,
    confirmCode: hashConfirmCode,
  });

  return res
    .status(201)
    .json({ message: lang == "EN" ? "Done" : "تم التسجيل  بنجاح", _id });
});

//signup branch to headquarter   // Done
export const registerBranchToPharmacy = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";

  const headquarter = await pharmacyModel.findOne({ email: req.user.email });
  if (!headquarter) {
    return next(
      new Error(
        lang == "EN"
          ? "Headquarter not exist"
          : "لم يتم العثور علي الفرع الرئسي",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }

  if (headquarter.headquarter) {
    return next(
      new Error(
        lang == "EN"
          ? "Sorry regural branch can act as head"
          : "عفوا لكن لايمكن ان يتم تسجل فرع عن طريق فرع اخر يجب يكون عن طريق الفرع الرئسي فقط",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }

  const { name, email, phone, password, address } = req.body;

  //check email exist
  if (await pharmacyModel.findOne({ email: email })) {
    return next(
      new Error(
        lang == "EN"
          ? "Email exist"
          : "عفوا يوجد حساب مسجل يحمل هذا البريد الالكتروني  بالفعل",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }
  //sendEmail()
  const hashConfirmCode = await handelConfirmCode({ req, email });
  //hashPassword
  const hashPassword = hash({ plaintext: password });
  // create pharmacy
  const branch = await pharmacyModel.create({
    name,
    email,
    phone: [
      {
        code: phone.split(" ")[0],
        number: phone.split(" ")[1],
        mainNumber: true,
      },
    ],
    country: address.country,
    address,
    imageFolderName: nanoid(),
    password: hashPassword,
    confirmCode: hashConfirmCode,
    headquarter: headquarter._id,
  });

  return res
    .status(201)
    .json({ message: lang == "EN" ? "Done" : "تم التسجيل  بنجاح", branch });
});


//license , certificates and open approve request //Done 
export const uploadPharmacyFiles = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;
  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });
  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  if (pharmacy.approved) {
    //save in temp path
    pharmacy.tempLicense = req.files?.license
      ? req.files.license[0].dest
      : null;
    pharmacy.tempCommercialRegister = req.files?.commercialRegister
      ? req.files.commercialRegister[0].dest
      : null;
    pharmacy.tempTaxCard = req.files?.taxCard
      ? req.files.taxCard[0].dest
      : null;
    pharmacy.updatedBy = req.user._id;
    await pharmacy.save();
    //pin request to review
    await PharmacyRequestModel.findOneAndUpdate(
      { pharmacyId },
      { updatedBy: req.user._id, recheck: true }
    );
    return res.json({
      message:
        lang == "EN"
          ? "Done , Pharmacy still working with the old certificates until system admin approve the new one"
          : "تم تسجيل بنجاح سيتم استمرار العمل بالوثائق القديمه الي حين موافقه الادمن علي الوثائق الجديده",
    });
  } else {
    //not approved yet
    // save in main path
    if (
      !req.files.license ||
      !req.files.commercialRegister ||
      !req.files.taxCard
    ) {
      return next(
        new Error(
          lang == "EN"
            ? "Please upload all pharmacy certificates"
            : "عفوا برجاء رفع جميع الملفات ",
          { cause: { code: 400, customCode: 1014 } }
        )
      );
    }

    const updatedPharmacy = await pharmacyModel.findByIdAndUpdate(pharmacyId, {
      license: req.files.license[0].dest,
      commercialRegister: req.files.commercialRegister[0].dest,
      taxCard: req.files.taxCard[0].dest,
      updatedBy: req.user._id,
    });

    if (!updatedPharmacy) {
      return next(
        new Error(
          lang == "EN"
            ? "Fail to update please try agin later"
            : "عفو برجاء  المحاوله في وقت لاحق",
          { cause: { code: 400, customCode: 1015 } }
        )
      );
    }

    // clear old files if exist
    if (pharmacy.license) {
      if (
        fs.existsSync(path.join(__dirname, `./../../../${pharmacy.license}`))
      ) {
        await unlink(path.join(__dirname, `./../../../${pharmacy.license}`));
      }
    }

    if (pharmacy.commercialRegister) {
      if (
        fs.existsSync(
          path.join(__dirname, `./../../../${pharmacy.commercialRegister}`)
        )
      ) {
        await unlink(
          path.join(__dirname, `./../../../${pharmacy.commercialRegister}`)
        );
      }
    }

    if (pharmacy.taxCard) {
      if (
        fs.existsSync(path.join(__dirname, `./../../../${pharmacy.taxCard}`))
      ) {
        await unlink(path.join(__dirname, `./../../../${pharmacy.taxCard}`));
      }
    }

    // update/open accept Request by  admin

    if (
      !(await PharmacyRequestModel.findOneAndUpdate(
        { pharmacyId },
        { updatedBy: req.user._id }
      ))
    ) {
      await PharmacyRequestModel.create({
        pharmacyId,
        createdBy: req.user._id,
      });
      return res.json({ message: lang == "EN" ? "Done" : "تم" });
    } else {
      return res.json({
        message:
          lang == "EN"
            ? "Done , and wait for admin approval"
            : "تم و في انتظار موافقه الادمن",
      });
    }
  }
});


//approve pharmacy request //Done
export const approvePharmacy = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;
  const request = await PharmacyRequestModel.findOne({ pharmacyId }).populate(
    "pharmacyId"
  );
  if (!request) {
    return next(
      new Error(
        lang == "EN" ? "not exist" : "عفو لم يتم العثور علي هذا الطلب",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }
  if (request.recheck) {
    // replace files  & approve

    //check temp and  save as new
    let license = request.pharmacyId.tempLicense
      ? request.pharmacyId.tempLicense
      : null;
    let taxCard = request.pharmacyId.tempTaxCard
      ? request.pharmacyId.tempTaxCard
      : null;
    let commercialRegister = request.pharmacyId.tempCommercialRegister
      ? request.pharmacyId.tempCommercialRegister
      : null;

    const updatedPharmacy = await pharmacyModel.findOneAndUpdate(
      { pharmacyId },
      {
        license: license ? license : request.pharmacyId.license,
        taxCard: taxCard ? taxCard : request.pharmacyId.taxCard,
        commercialRegister: commercialRegister
          ? commercialRegister
          : request.pharmacyId.commercialRegister,

        tempCommercialRegister: null,
        tempLicense: null,
        tempTaxCard: null,

        approved: true,
        updatedBy: req.user._id,
      }
    );

    if (!updatedPharmacy) {
      return next(
        new Error(
          lang == "EN"
            ? "Fail to update please try agin later"
            : "عفو برجاء  المحاوله في وقت لاحق",
          { cause: { code: 400, customCode: 1015 } }
        )
      );
    }

    //Remove old files
    if (license) {
      if (
        fs.existsSync(
          path.join(__dirname, `./../../../${updatedPharmacy.license}`)
        )
      ) {
        await unlink(
          path.join(__dirname, `./../../../${updatedPharmacy.license}`)
        );
      }
    }

    if (commercialRegister) {
      if (
        fs.existsSync(
          path.join(
            __dirname,
            `./../../../${updatedPharmacy.commercialRegister}`
          )
        )
      ) {
        await unlink(
          path.join(
            __dirname,
            `./../../../${updatedPharmacy.commercialRegister}`
          )
        );
      }
    }

    if (taxCard) {
      if (
        fs.existsSync(
          path.join(__dirname, `./../../../${updatedPharmacy.taxCard}`)
        )
      ) {
        await unlink(
          path.join(__dirname, `./../../../${updatedPharmacy.taxCard}`)
        );
      }
    }
    // request approve

    request.approved = true;
    request.approvedBy = req.user._id;
    request.updatedBy = req.user._id;
    request.recheck = false;
    await request.save();
    return res.json({ message: lang == "EN" ? "Done " : "تم " });
  } else {
    // approve
    const updatedPharmacy = await pharmacyModel.findOneAndUpdate(
      { pharmacyId },
      {
        approved: true,
        updatedBy: req.user._id,
      }
    );

    if (!updatedPharmacy) {
      return next(
        new Error(
          lang == "EN"
            ? "Fail to update please try agin later"
            : "عفو برجاء  المحاوله في وقت لاحق",
          { cause: { code: 400, customCode: 1015 } }
        )
      );
    }

    request.approved = true;
    request.approvedBy = req.user._id;
    request.updatedBy = req.user._id;
    await request.save();
    return res.json({ message: lang == "EN" ? "Done " : "تم " });
  }
});

//Reject pharmacy TODO
export const rejectPharmacy = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
});

/////////////////////////////////////////////////////////      Auth         ///////////////////////////////////////////////////
export const confirmPharmacyEmail = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { code, email } = req.body;
  const user = await pharmacyModel.findOne({ email });
  console.log({ user });
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }
  if (user.confirmEmail) {
    return next(
      new Error(lang == "EN" ? "Already confirmed" : "تم التحقق مسبقا", {
        cause: { code: 400, customCode: 1005 },
      })
    );
  }

  if (!compare({ plaintext: code, hashValue: user.confirmCode })) {
    return next(
      new Error(
        lang == "EN" ? "In-valid activation code" : "عفوا رقم التعريف غير صحيح",
        { cause: { code: 400, customCode: 1006 } }
      )
    );
  }

  await pharmacyModel.updateOne(
    { email },
    { confirmEmail: true, confirmCode: null }
  );
  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم" });
});

export const requestNewPharmacyConfirmEmail = asyncHandler(
  async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const { email } = req.body;
    const user = await pharmacyModel.findOne({ email });
    if (!user) {
      return next(
        new Error(
          lang == "EN"
            ? "Not register account"
            : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
          { cause: { code: 404, customCode: 1004 } }
        )
      );
    }

    if (user.confirmEmail) {
      return next(
        new Error(lang == "EN" ? "Already confirmed" : "تم التحقق مسبقا", {
          cause: { code: 400, customCode: 1005 },
        })
      );
    }

    //sendEmail()
    const hashConfirmCode = await handelConfirmCode({ req, email });
    await pharmacyModel.findByIdAndUpdate(
      user._id,
      { confirmCode: hashConfirmCode },
      { new: true }
    );
    return res.status(200).json({ message: lang == "EN" ? "Done" : "تم" });
  }
);

export const sendForgetCodeToPharmacy = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { email } = req.body;
  const user = await pharmacyModel.findOne({ email });
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  const forgetCode = await handelConfirmCode({
    req,
    email,
    subject: "Forget password",
  });
  await pharmacyModel.updateOne({ email }, { forgetCode: forgetCode });
  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم" });
});

export const forgetPasswordToPharmacy = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { email, forgetCode, password } = req.body;

  const user = await pharmacyModel.findOne({ email });
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (!compare({ plaintext: forgetCode, hashValue: user.forgetCode })) {
    return next(
      new Error(lang == "EN" ? "In-valid reset code" : "تم ادخال كود خطاء", {
        cause: { code: 400, customCode: 1006 },
      })
    );
  }

  user.password = hash({ plaintext: password });
  user.forgetCode = null;
  user.changePasswordTime = Date.now();
  await user.save();
  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم" });
});

export const requestNewAccessTokenToPharmacy = asyncHandler(
  async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { token } = req.body;

    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      return next(
        new Error(lang == "EN" ? "In-valid token payload" : "خطاء", {
          cause: { code: 400, customCode: 1010 },
        })
      );
    }
    const user = await pharmacyModel.findById(decoded.id);
    if (!user) {
      return next(
        new Error(
          lang == "EN"
            ? "Not register account"
            : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
          { cause: { code: 404, customCode: 1004 } }
        )
      );
    }
    if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
      return next(
        new Error(
          lang == "EN"
            ? "Expired token"
            : "عفوا لقد قمت باستخدام جمله ارتباط منتهيه الصلاحيه برجاء تسجيل الدخول مجددا",
          { cause: { code: 400, customCode: 1012 } }
        )
      );
    }

    const access_token = generateToken({
      payload: { id: user._id, role: user.role, fullName: user.fullName },
      expiresIn: 86400, // 1d 60*60*24
    });

    const refresh_token = generateToken({
      payload: { id: user._id, role: user.role, fullName: user.fullName },
      expiresIn: 31536000, //1year 60 * 60 * 24 * 365
    });

    return res.status(200).json({
      message: lang == "EN" ? "Done" : "تم",
      access_token,
      refresh_token,
    });
  }
);

// pharmacy login //Done
export const PharmacyLogin = asyncHandler(async (req, res, next) => {
  let lang = req.headers.lang || "EN";
  const { email, password, playerId } = req.body;
  const { agent } = req.headers;
  //check email exist
  const user = await pharmacyModel.findOne({ email: email });
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (agent === "web") {
    return next(
      new Error(
        lang == "EN"
          ? "Sorry, you only allowed to login from the mobile"
          : "عفوا يمكنك الدخول من الموبايل فقط",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  if (!user.confirmEmail) {
    return next(
      new Error(
        lang == "EN"
          ? "Please confirm your email first"
          : "عفوا لم يتم تفعيل من هذا البريد الالكتروني بعد براجاء تفعيل  اولا",
        { cause: { code: 400, customCode: 1007 } }
      )
    );
  }

  if (!compare({ plaintext: password, hashValue: user.password })) {
    return next(
      new Error(
        lang == "EN"
          ? "In-valid login data"
          : "عفوا يرجا التاكد من  البريد الالكتروني و كلمه السر",
        { cause: { code: 400, customCode: 1009 } }
      )
    );
  }
  const access_token = generateToken({
    payload: { id: user._id, role: user.role, fullName: user.fullName },
    expiresIn: 86400, // 1d 60*60*24
  });

  const refresh_token = generateToken({
    payload: { id: user._id, role: user.role, fullName: user.fullName },
    expiresIn: 31536000, //1year 60 * 60 * 24 * 365
  });

  user.playerId = playerId;
  await user.save();

  return res.status(200).json({
    message: lang == "EN" ? "Done" : "تم تسجيل الدخول بنجاح",
    access_token,
    refresh_token,
  });
});

////////////////////////////////////////////////// Pharmacy employee  /////////////////////////////////////////////////////////

// hire employee  //Done
export const hireEmployee = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { pharmacyId, employeeId } = req.params;
  const employee = await userModel.findById(employeeId).populate("role");
  if (!employee) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }
  if (employee.role.title != "user") {
    return next(
      new Error(
        lang == "EN"
          ? `Sorry cannot hire employee  except those of type user `
          : "عفوا ولكن لا يمكن ادراج موظف يحمل صلاحيات اخري غير مستخدم عادي",
        { cause: { code: 401, customCode: 1001 } }
      )
    );
  }

  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  await pharmacyModel.findOneAndUpdate(
    { _id: pharmacyId },
    {
      $addToSet: { employee: employeeId },
      updatedBy: req.user._id,
    },
    { new: true }
  );

  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});
// fire employee //Done
export const fireEmployee = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { pharmacyId, employeeId } = req.params;

  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  await pharmacyModel.findOneAndUpdate(
    { _id: pharmacyId },
    {
      $pull: { employee: employeeId },
      updatedBy: req.user._id,
    },
    { new: true }
  );

  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});
// pharmacy employee login //Done
export const pharmacyEmployeeLogin = asyncHandler(async (req, res, next) => {
  let lang = req.headers.lang || "EN";
  const { pharmacyEmail, employeeEmail, employeePassword } = req.body;
  //check email exist
  const pharmacy = await pharmacyModel
    .findOne({ email: pharmacyEmail })
    .populate([
      {
        path: "employee",
      },
    ]);
  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "pharmacy  not exist"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (agent === "web") {
    return next(
      new Error(
        lang == "EN"
          ? "Sorry, you only allowed to login from the mobile"
          : "عفوا يمكنك الدخول من الموبايل فقط",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  if (!pharmacy.confirmEmail) {
    return next(
      new Error(
        lang == "EN"
          ? "Please confirm your email first"
          : "عفوا لم يتم تفعيل من هذا البريد الالكتروني بعد براجاء تفعيل  اولا",
        { cause: { code: 400, customCode: 1007 } }
      )
    );
  }

  if (!pharmacy.employee?.length) {
    return next(
      new Error(
        lang == "EN"
          ? "Not a register employee"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  const employee = pharmacy.employee.find((emp) => {
    return emp.email == employeeEmail.toLowerCase();
  });

  // TODO >>> playerId

  if (!employee) {
    return next(
      new Error(
        lang == "EN"
          ? "Not a register employee"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (!employee.confirmEmail) {
    return next(
      new Error(
        lang == "EN"
          ? "Please confirm your email first"
          : "عفوا لم يتم تفعيل من هذا البريد الالكتروني بعد براجاء تفعيل  اولا",
        { cause: { code: 400, customCode: 1007 } }
      )
    );
  }

  if (!compare({ plaintext: employeePassword, hashValue: employee.password })) {
    return next(
      new Error(
        lang == "EN"
          ? "In-valid login data"
          : "عفوا يرجا التاكد من  البريد الالكتروني و كلمه السر",
        { cause: { code: 400, customCode: 1009 } }
      )
    );
  }

  const access_token = generateToken({
    payload: {
      id: employee._id,
      role: employee.role,
      fullName: employee.fullName,
    },
    expiresIn: 86400, // 1d 60*60*24
  });

  const refresh_token = generateToken({
    payload: {
      id: employee._id,
      role: employee.role,
      fullName: employee.fullName,
    },
    expiresIn: 31536000, //1year 60 * 60 * 24 * 365
  });

  return res.status(200).json({
    message: lang == "EN" ? "Done" : "تم تسجيل الدخول بنجاح",
    access_token,
    refresh_token,
  });
});


/////////////////////////////////////////////////   Settings      /////////////////////////////////////////////////////////////////
//Update pharmacy basic info //Done
export const updatePharmacyBasicInfo = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;


  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  if (req.body.address) {
    req.body.country = req.body.address.country;
  }
  await pharmacyModel.findOneAndUpdate(
    { _id: pharmacyId },
    {
      ...req.body, // name , address , country
      updatedBy: req.user._id,
    },
    { new: true }
  );

  return res.json({ message: lang == "EN" ? "Done" : "تم" });

});

//pharmacy image  //Done
export const pharmacyImage = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;
  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });
  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  if (pharmacy.image) {
    const fullPath = path.join(__dirname, `./../../../${pharmacy.image}`);
    if (fs.existsSync(fullPath)) {
      await unlink(fullPath);
    }
  }

  pharmacy.image = req.file.dest;
  pharmacy.save();

  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});

//Delete Pharmacy //TODO
export const deletePharmacy = asyncHandler(async (req, res, next) => {
  let lang = req.headers.lang || "EN";
  //by  headquarter only
});

//update password //Done
export const updatePassword = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (oldPassword == newPassword) {
    return next(
      new Error(
        lang == "EN"
          ? `Sorry new password is the same as old password !`
          : "    عفوا لايمكن تحديث الرقم السري بنفي الرقم القديم  ",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }

  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }



  if (!compare({ plaintext: oldPassword, hashValue: pharmacy.password })) {
    return next(
      new Error(
        lang == "EN" ? "In-valid Password" : "عفوا يرجا التاكد من كلمه السر",
        { cause: { code: 400, customCode: 1009 } }
      )
    );
  }
  //hashPassword
  const hashPassword = hash({ plaintext: newPassword });
  const updatedPharmacy = await pharmacyModel.findByIdAndUpdate(
    pharmacyId,
    { password: hashPassword, changePasswordTime: Date.now(), updatedBy: req.user._id },
    { new: true }
  );
  if (!updatedPharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? `Something went wrong`
          : "    عفوا برجاء اعاده المحاوله ",
        { cause: { code: 400, customCode: 1016 } }
      )
    );
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم", pharmacy: updatedPharmacy });
});

//update email //Done
export const updateEmail = asyncHandler(async (req, res, next) => {


  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;


  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }



  const { email } = req.body;
  if (email == pharmacy.email) {
    return next(
      new Error(
        lang == "EN"
          ? `Sorry new email is the same as old email !`
          : " عفوا لايمكن تحديث الرقم البريد الالكتروني بنفس  القديم  ",
        { cause: { code: 409, customCode: 1017 } }
      )
    );
  }



  if (await pharmacyModel.findOne({ email: email })) {
    return next(
      new Error(
        lang == "EN"
          ? "Email exist"
          : "عفوا يوجد حساب مسجل يحمل هذا البريد الالكتروني  بالفعل",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }
  //sendEmail()
  const hashConfirmCode = await handelConfirmCode({ req, email });

  const updatedPharmacy = await pharmacyModel.findByIdAndUpdate(
    pharmacyId,
    {
      email,
      confirmCode: hashConfirmCode,
      changePasswordTime: Date.now(),
      confirmEmail: false,
    },
    { new: true }
  );
  if (!updatedPharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? `Something went wrong`
          : "    عفوا برجاء اعاده المحاوله ",
        { cause: { code: 400, customCode: 1016 } }
      )
    );
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم", pharmacy: updatedPharmacy });
});

//add phone 
export const addPhone = asyncHandler(async (req, res, next) => {


  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;
  const { phone } = req.body;

  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }




  let updatedPharmacy;
  if (phone.mainNumber) {
    updatedPharmacy = await pharmacyModel.findByIdAndUpdate(

      { _id: pharmacyId, "phone": { $elemMatch: { mainNumber: true } } }, // Find the document with an array element where mainNumber is already true
      { $set: { "phone.$[elem].mainNumber": false } }, // Set the existing true element to false
      { arrayFilters: [{ "elem.mainNumber": true }], new: true }, // Array filter to update only the element with yourBooleanField true
    );

    updatedPharmacy.phone.push(phone)
    await updatedPharmacy.save()
  } else {
    updatedPharmacy = await pharmacyModel.findByIdAndUpdate(
      pharmacyId,
      {
        $push: { phone: phone },
      },
      { new: true }
    );
  }

  if (!updatedPharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? `Something went wrong`
          : "    عفوا برجاء اعاده المحاوله ",
        { cause: { code: 400, customCode: 1016 } }
      )
    );
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم", pharmacy: updatedPharmacy });
});

// delete phone

export const deletePhone = asyncHandler(async (req, res, next) => {


  const lang = req.headers.lang || "EN";
  const { pharmacyId } = req.params;
  const { phoneId } = req.body;

  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }




  const updatedPharmacy = await pharmacyModel.findByIdAndUpdate(
    pharmacyId,
    {
      $pull: { phone: { _id: { $in: phoneId } } },
    },
    { new: true }
  );


  if (!updatedPharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? `Something went wrong`
          : "    عفوا برجاء اعاده المحاوله ",
        { cause: { code: 400, customCode: 1016 } }
      )
    );
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم", pharmacy: updatedPharmacy });
});
// mark as a main phone
export const markAsMainPhone = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";

  const { pharmacyId, phoneId } = req.params;

  const pharmacy = await pharmacyModel.findById(pharmacyId).populate({
    path: "headquarter",
  });

  if (!pharmacy) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم العثور علي هذا الحساب برجاء التاكد من البيانات",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }

  if (
    pharmacy.email != req.user.email.toLowerCase() &&
    pharmacy.headquarter?.email != req.user.email.toLowerCase()
  ) {
    return next(
      new Error(
        lang == "EN" ? "Not authorized manger" : "عفو لا تمتلك الصلاحيه",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }


  const updatedPharmacy = await pharmacyModel.findByIdAndUpdate(

    { _id: pharmacyId, "phone": { $elemMatch: { mainNumber: true } } }, // Find the document with an array element where mainNumber is already true
    { $set: { "phone.$[elem].mainNumber": false } }, // Set the existing true element to false
    { arrayFilters: [{ "elem.mainNumber": true }], new: true }, // Array filter to update only the element with yourBooleanField true
  );
  for (const phone of updatedPharmacy.phone) {
    if (phone._id.toString() == phoneId) {
      phone.mainNumber = true;
      break;
    }
  }
  await updatedPharmacy.save()
  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    pharmacy: updatedPharmacy
  });
});


