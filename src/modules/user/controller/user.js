import User from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import _, { forEach } from "underscore";
import fs from "fs";
import userModel from "../../../../DB/model/User.model.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import { handelConfirmCode } from "../../auth/controller/registration.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const profile = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  const user = await User.findById(req.user._id)
    .select(
      "email fullName image phone address gender status -_id height weight blood chronicDiseases"
    )
    .populate([
      {
        path: "chronicDiseases",
      },
    ]);
  return res.json({ message: lang == "EN" ? "Done" : "تم", user });
});

export const profilePic = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";

  const user = await User.findById(req.user._id)
    .select(
      "email fullName image phone address gender status _id height weight blood chronicDiseases"
    )
    .populate([
      {
        path: "chronicDiseases",
      },
    ]);

  if (user.image?.length > 0) {
    const fullPath = path.join(__dirname, `./../../../${user.image}`);
    if (fs.existsSync(fullPath)) {
      await unlink(fullPath);
    }
  }

  user.image = req.file.dest;
  await user.save();

  return res.json({ message: lang == "EN" ? "Done" : "تم", user });
});

export const addAddress = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";

  let user;
  if (req.body?.mainAddress) {
    user = await userModel.findByIdAndUpdate(

      { _id: req.user._id, "address": { $elemMatch: { mainAddress: true } } }, // Find the document with an array element where mainAddress is already true
      { $set: { "address.$[elem].mainAddress": false } }, // Set the existing true element to false
      { arrayFilters: [{ "elem.mainAddress": true }], new: true }, // Array filter to update only the element with yourBooleanField true
    );

    user.address.push(req.body)
    await user.save()
  } else {
    user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $push: { address: { ...req.body } },
      },
      { new: true }
    );
  }

  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    address: user.address,
  });
});

export const deleteAddress = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";


  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { address: { _id: req.params.addressId } },
    },
    { new: true }
  );

  return res.json({
    message: lang == "EN" ? "Done" : "تم"
  });
});

export const markAsMainAddress = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";


  const user = await userModel.findByIdAndUpdate(

    { _id: req.user._id, "address": { $elemMatch: { mainAddress: true } } }, // Find the document with an array element where mainAddress is already true
    { $set: { "address.$[elem].mainAddress": false } }, // Set the existing true element to false
    { arrayFilters: [{ "elem.mainAddress": true }], new: true }, // Array filter to update only the element with yourBooleanField true
  );
  for (const address of user.address) {
    if (address._id.toString() == req.params.addressId) {
      address.mainAddress = true;
      break;
    }
  }
  await user.save()
  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    address: user.address
  });
});



export const addPhone = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";


  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    { $push: { phone: { ...req.body.phone } } },
    { new: true },
  );

  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    phone: user.phone
  });
});

export const removePhone = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";


  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    { $pull: { phone: { _id: req.params.phoneId } } },
    { new: true },
  );

  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    phone: user.phone
  });
});


export const addChronicDaises = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";


  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    { $addToSet: { chronicDiseases: req.body.chronicDiseases } },
    { new: true },
  );

  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    chronicDiseases: user.chronicDiseases
  });
});

export const removeChronicDaises = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";


  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    { $pull: { chronicDiseases: { $in: req.body.chronicDiseases } } },
    { new: true },
  );

  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    chronicDiseases: user.chronicDiseases
  });
});



export const updatePassword = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
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

  if (!compare({ plaintext: oldPassword, hashValue: req.user.password })) {
    return next(
      new Error(
        lang == "EN" ? "In-valid Password" : "عفوا يرجا التاكد من كلمه السر",
        { cause: { code: 400, customCode: 1009 } }
      )
    );
  }
  //hashPassword
  const hashPassword = hash({ plaintext: newPassword });
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { password: hashPassword, changePasswordTime: Date.now() },
    { new: true }
  );
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? `Something went wrong`
          : "    عفوا برجاء اعاده المحاوله ",
        { cause: { code: 400, customCode: 1016 } }
      )
    );
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم", user });
});

export const updateEmail = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  const { email } = req.body;
  if (email == req.user.email) {
    return next(
      new Error(
        lang == "EN"
          ? `Sorry new email is the same as old email !`
          : " عفوا لايمكن تحديث الرقم البريد الالكتروني بنفس  القديم  ",
        { cause: { code: 409, customCode: 1017 } }
      )
    );
  }

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

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      email,
      confirmCode: hashConfirmCode,
      changePasswordTime: Date.now(),
      confirmEmail: false,
    },
    { new: true }
  );
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? `Something went wrong`
          : "    عفوا برجاء اعاده المحاوله ",
        { cause: { code: 400, customCode: 1016 } }
      )
    );
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم", user });
});

export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  // if (req.body.phone) {
  //   req.body.phone = { code: req.body.phone.split(" ")[0], number: req.body.phone.split(" ")[1] };
  // }

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true }
  );
  if (!user) {
    return next(
      new Error(
        lang == "EN"
          ? `Something went wrong`
          : "    عفوا برجاء اعاده المحاوله ",
        { cause: { code: 400, customCode: 1016 } }
      )
    );
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم", user });
});




export const sendNotification = asyncHandler(async (req, res, next) => {
  // user
  const { lat, long } = req.body;

  // pharmacies
  let buffer = 100 * 1000;
  const results = await Pharmacy.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lat, long], buffer / 6371000],
      },
    },
  });

  // send notification to those pharmacies // TODO >>>>
});
