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

export const handelConfirmCode = async ({
  email,
  subject = "Confirmation-Email",
} = {}) => {
  //sendEmail()
  const confirmCode = customAlphabet("1234506789", 4)();
  const html = emailTemplate({ body: confirmCode });

  if (!(await sendEmail({ to: email, subject, html }))) {
    return next(new Error("Email rejected", { cause: {code:400} }));
  }
  //hash confirmCode
  const hashConfirmCode = hash({ plaintext: confirmCode });
  return hashConfirmCode;
};

export const preSignup = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  //check email exist
  if (await userModel.findOne({ email: email })) {
    return next(new Error("Email exist", { cause: { code: 409, customCode: 1000 } }));
  }
  //sendEmail()
  const hashConfirmCode = await handelConfirmCode({ email });
  //hashPassword
  const hashPassword = hash({ plaintext: password });
  //create user
  const { _id } = await userModel.create({
    email,
    password: hashPassword,
    confirmCode: hashConfirmCode,
  });
  return res.status(201).json({ message: "Done", _id });
});

export const completeSignup = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, gender, country , chronicDiseases } = req.body;
  //check email exist
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Not register account", { cause: { code: 404, customCode: 1004 } } ));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first",  { cause: { code: 404, customCode: 1007 } }  ));
  }

  //create user
  const { _id } = await userModel.findOneAndUpdate(
    { email },
    {
      fullName,
      country,
      chronicDiseases,
      gender: { AR: gender == 'male' || gender == 'ذكر' ? 'ذكر' : 'انثى', EN: gender == 'male' || gender == 'ذكر' ? 'male' : 'female' },
      phone: { code: phone.split(" ")[0], number: phone.split(" ")[1] },
    }
  );
  return res.status(201).json({ message: "Done", _id });
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
  const { code, email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return next(new Error("Not register account", { cause: { code: 404, customCode: 1004 } }));
  }
  if (user.confirmEmail) {
    return next(new Error("Already confirmed",{ cause: { code: 400, customCode: 1005 } }));
  }

  if (!compare({ plaintext: code, hashValue: user.confirmCode })) {
    return next(new Error("In-valid activation code", { cause: { code: 400, customCode: 1006 } }));
  }

  await userModel.updateOne(
    { email: user.email },
    { confirmEmail: true, confirmCode: null }
  );
  return res.status(200).json({ message: "Done" });
});

export const requestNewConfirmEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Not register account",  { cause: { code: 404, customCode: 1004 } }));
  }

  if (user.confirmEmail) {
    return next(new Error("Already confirmed", { cause: { code: 400, customCode: 1005 } }));
  }

  //sendEmail()
  const hashConfirmCode = await handelConfirmCode({ email });
  await userModel.findByIdAndUpdate(
    user._id,
    { confirmCode: hashConfirmCode },
    { new: true }
  );
  return res.status(200).json({ message: "Done" });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  //check email exist
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return next(new Error("Not register account", { cause: { code: 404, customCode: 1004 } }));
  }

  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first", { cause: { code: 400, customCode: 1007 } } ));
  }
  if (!user.status == "blocked") {
    return next(new Error("blocked account", { cause: { code: 400, customCode: 1008} } ));
  }

  if (!compare({ plaintext: password, hashValue: user.password })) {
    return next(new Error("In-valid login data", { cause: { code: 400, customCode: 1009} }));
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
  await user.save();
  return res.status(200).json({ message: "Done", access_token, refresh_token });
});


export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Not register account", { cause: { code: 404, customCode: 1004 } }));
  }

  const forgetCode = await handelConfirmCode({
    email,
    subject: "Forget password",
  });
  await userModel.updateOne({ email }, { forgetCode: forgetCode });
  return res.status(200).json({ message: "Done" });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, forgetCode, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Not register account", { cause: {code:404, customCode:1004} }));
  }

  if (!compare({ plaintext: forgetCode, hashValue: user.forgetCode })) {
    return next(new Error("In-valid reset code", { cause: { code: 400, customCode: 1006} }));
  }

  user.password = hash({ plaintext: password });
  user.forgetCode = null;
  user.changePasswordTime = Date.now();
  await user.save();
  return res.status(200).json({ message: "Done" });
});

export const requestNewAccessToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  const decoded = verifyToken({ token });
  if (!decoded?.id) {
    return next(new Error("In-valid token payload", { cause: {code:400 , customCode:1010} }));
  }
  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new Error("Not register user", { cause: { code: 404, customCode: 1004 } }));
  }
  if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
    return next(new Error("Expired token", { cause: 400 }));
  }

  const access_token = generateToken({
    payload: { id: user._id, role: user.role, fullName: user.fullName },
    expiresIn: 86400, // 1d 60*60*24
  });

  const refresh_token = generateToken({
    payload: { id: user._id, role: user.role, fullName: user.fullName },
    expiresIn: 31536000, //1year 60 * 60 * 24 * 365
  });

  return res.status(200).json({ message: "Done", access_token, refresh_token });
});

// Register admin
export const registerAdmin = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, gender, password,country } = req.body;

  //check email exist
  if (await userModel.findOne({ email: email })) {
    return next(new Error("Email exist", { cause: 409 }));
  }
  //sendEmail()
  const hashConfirmCode = await handelConfirmCode({ email });

  //hashPassword
  const hashPassword = hash({ plaintext: password });
  //create user
  const role = await roleModel.findOne({ title: "admin" });
  if (!role) {
    return next(new Error("NO assigned role ", { cause: 400 }));
  }
  console.log({ role });
  const { _id } = await userModel.create({
    email,
    confirmCode: hashConfirmCode,
    fullName,
    country,
    password: hashPassword,
    gender: { AR: gender == 'male' || gender == 'ذكر' ? 'ذكر' : 'انثى', EN: gender == 'male' || gender == 'ذكر' ? 'male' : 'female' },
    phone: { code: phone.split(" ")[0], number: phone.split(" ")[1] },
    role: role._id,
  });
  return res.status(201).json({ message: "Done", _id });
});
