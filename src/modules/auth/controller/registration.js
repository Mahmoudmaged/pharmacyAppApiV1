import userModel from "../../../../DB/model/User.model.js";
import roleModel from "../../../../DB/model/Role.model.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/GenerateAndVerifyToken.js";
import sendEmail, { emailTemplate } from "../../../utils/email.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { nanoid, customAlphabet } from "nanoid";
import { OAuth2Client } from "google-auth-library";
import ChronicDiseaseModel from "../../../../DB/model/ChronicDisease.model.js";

export const handelConfirmCode = async ({
  req,
  email,
  subject = "Confirmation-Email",
} = {}) => {
  const lang = req.headers.lang || "EN";
  //sendEmail()
  const confirmCode = customAlphabet("1234506789", 4)();
  const html = emailTemplate({ body: confirmCode });

  if (!(await sendEmail({ to: email, subject, html }))) {
    return next(
      new Error(
        lang == "EN"
          ? "Email rejected"
          : " عفوا تم رفض هذا البريد الالكتروني برجاء التحقق منه",
        { cause: { code: 400 } }
      )
    );
  }
  //hash confirmCode
  const hashConfirmCode = hash({ plaintext: confirmCode });
  return hashConfirmCode;
};

export const preSignup = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { email, password } = req.body;
  //check email exist
  if (await userModel.findOne({ email: email })) {
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
  //create user
  const { _id } = await userModel.create({
    email,
    password: hashPassword,
    confirmCode: hashConfirmCode,
  });
  return res
    .status(201)
    .json({ message: lang == "EN" ? "Done" : "تم التسجيل بنجاح", _id });
});

export const completeSignup = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { fullName, email, phone, gender, country, chronicDiseases } = req.body;
  //check email exist
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? "Not register account"
          : "عفوا لم يتم تسجيل هذا الحساب من قبل يرجا التسجيل اولا",
        { cause: { code: 404, customCode: 1004 } }
      )
    );
  }
  if (!user.confirmEmail) {
    return next(
      new Error(
        lang == "EN"
          ? "Please confirm your email first"
          : "عفوا لم يتم تحقيق هذا البريد الالكتروني من قبل برجاء التاكيد اولا ",
        { cause: { code: 404, customCode: 1007 } }
      )
    );
  }

  if (chronicDiseases?.length) {
    for (const [index, id] of chronicDiseases.entries()) {
      if (!(await ChronicDiseaseModel.findById(id))) {
        return next(
          new Error(
            lang == "EN" ? "In-valid dieses ID" : "لم يتم العثور علي المرض",
            { cause: { code: 404, customCode: 1004 } }
          )
        );
      }
    }
  }

  //create user
  const { _id } = await userModel.findOneAndUpdate(
    { email },
    {
      fullName,
      country,
      chronicDiseases,
      gender: {
        AR: gender == "male" || gender == "ذكر" ? "ذكر" : "انثى",
        EN: gender == "male" || gender == "ذكر" ? "male" : "female",
      },
      phone: { code: phone.split(" ")[0], number: phone.split(" ")[1] },
    }
  );
  return res
    .status(201)
    .json({ message: lang == "EN" ? "Done" : "تم التسجيل  بنجاح", _id });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client(process.env.CLIENT_ID);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const { email, email_verified, name, given_name, family_name, picture } =
    await verify();
  if (!email_verified) {
    return next(new Error("In-valid email", { cause: 400 }));
  }
  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (user) {
    //login
    if (user.provider != "GOOGLE") {
      return next(
        new Error(`In-valid provider true provider is ${user.provider}`, {
          cause: 400,
        })
      );
    }
    const access_token = generateToken({
      payload: { id: user._id, role: user.role },
      expiresIn: 60 * 30,
    });

    const refresh_token = generateToken({
      payload: { id: user._id, role: user.role },
      expiresIn: 60 * 60 * 24 * 365,
    });

    user.status = "online";
    await user.save();
    return res
      .status(200)
      .json({ message: "Done", access_token, refresh_token });
  }

  // signup
  //hashPassword
  const customPassword = customAlphabet(
    "0123456789hedwpibcexgyiygqndihspiufewqhpiu",
    9
  );
  const hashPassword = hash({ plaintext: customPassword() });
  //create user
  const { _id, role } = await userModel.create({
    fistName: given_name,
    lastName: family_name,
    image: { secure_url: picture },
    fullName: name,
    email,
    password: hashPassword,
    confirmEmail: true,
    provider: "GOOGLE",
    status: "online",
  });
  const access_token = generateToken({
    payload: { id: _id, role },
    expiresIn: 60 * 30,
  });

  const refresh_token = generateToken({
    payload: { id: _id, role },
    expiresIn: 60 * 60 * 24 * 365,
  });

  return res.status(201).json({ message: "Done", access_token, refresh_token });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { code, email } = req.body;
  const user = await userModel.findOne({ email: email });
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

  await userModel.updateOne(
    { email: user.email },
    { confirmEmail: true, confirmCode: null }
  );
  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم" });
});

export const requestNewConfirmEmail = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";

  const { email } = req.body;
  const user = await userModel.findOne({ email });
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
  await userModel.findByIdAndUpdate(
    user._id,
    { confirmCode: hashConfirmCode },
    { new: true }
  );
  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم" });
});

export const login = asyncHandler(async (req, res, next) => {
  let lang = req.headers.lang || "EN";

  const { email, password, playerId } = req.body;
  const { agent } = req.headers;
  //check email exist
  const user = await userModel.findOne({ email: email });

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

  const role = await roleModel.findById(user.role);

  if (agent === "mobile" && role.title !== "user") {
    return next(
      new Error(
        lang == "EN"
          ? "Sorry, not allowed to login from the mobile"
          : " عفوا لا يمكنك الدخول من الموبايل",
        { cause: { code: 403, customCode: 1003 } }
      )
    );
  }

  if (agent === "web" && role.title === "user") {
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
  if (!user.status == "blocked") {
    return next(
      new Error(lang == "EN" ? "blocked account" : "عفوا تم تعليق هذا الحساب", {
        cause: { code: 400, customCode: 1008 },
      })
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

  user.status = "online";
  user.playerId = playerId;
  await user.save();
  return res.status(200).json({
    message: lang == "EN" ? "Done" : "تم تسجيل الدخول بنجاح",
    access_token,
    refresh_token,
  });
});

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { email } = req.body;
  const user = await userModel.findOne({ email });
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
  await userModel.updateOne({ email }, { forgetCode: forgetCode });
  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم" });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { email, forgetCode, password } = req.body;

  const user = await userModel.findOne({ email });
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

export const requestNewAccessToken = asyncHandler(async (req, res, next) => {
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
  const user = await userModel.findById(decoded.id);
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
});

// Register admin
export const registerAdmin = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { fullName, email, phone, gender, password, country, chronicDiseases } =
    req.body;
  //check email exist
  if (await userModel.findOne({ email: email })) {
    return next(
      new Error(
        lang == "EN"
          ? "Email exist"
          : "عفوا يوجد حساب مسجل يحمل هذا البريد الالكتروني  بالفعل",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }

  if (chronicDiseases?.length) {
    for (const [index, id] of chronicDiseases.entries()) {
      if (!(await ChronicDiseaseModel.findById(id))) {
        return next(
          new Error(
            lang == "EN" ? "In-valid dieses ID" : "لم يتم العثور علي المرض",
            { cause: { code: 404, customCode: 1004 } }
          )
        );
      }
    }
  }
  //sendEmail()
  const hashConfirmCode = await handelConfirmCode({ req, email });

  //hashPassword
  const hashPassword = hash({ plaintext: password });
  //create user
  const role = await roleModel.findOne({ title: "admin" });
  if (!role) {
    return next(
      new Error(
        lang == "EN" ? "NO assigned role" : "برجاء اختيار صلاحيه المستخدم",
        { cause: { code: 400, customCode: 1013 } }
      )
    );
  }

  const { _id } = await userModel.create({
    email,
    confirmCode: hashConfirmCode,
    fullName,
    country,
    password: hashPassword,
    gender: {
      AR: gender == "male" || gender == "ذكر" ? "ذكر" : "انثى",
      EN: gender == "male" || gender == "ذكر" ? "male" : "female",
    },
    phone: { code: phone.split(" ")[0], number: phone.split(" ")[1] },
    role: role._id,
  });
  return res
    .status(201)
    .json({ message: lang == "EN" ? "Done" : "تم التسجيل بنجاح", _id });
});
