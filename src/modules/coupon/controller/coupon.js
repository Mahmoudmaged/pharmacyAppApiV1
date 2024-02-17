import slugify from "slugify";
import couponModel from "../../../../DB/model/Coupon.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { unlink } from "node:fs/promises";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getCoupon = asyncHandler(async (req, res, next) => {
  const { onlyValid } = req.body; // true optional
  let coupon;
  if (onlyValid) {
    coupon = await couponModel.find({ expire: { $gt: Date.now() } });
  } else {
    coupon = await couponModel.find({});
  }
  const lang = req.headers?.lang || "EN";
  return res
    .status(200)
    .json({ message: lang == "EN" ? "Done" : "تم", coupon });
});

export const createCoupon = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  const name = req.body.name.toLowerCase();
  if (await couponModel.findOne({ name })) {
    return next(
      new Error(
        lang == "EN" ? `Coupon already existed` : "اسم الكوبون موجود بالفعل",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }

  req.body.createdBy = req.user._id;
  req.body.expire = new Date(req.body.expire);
  const coupon = await couponModel.create(req.body);
  return res
    .status(201)
    .json({ message: lang == "EN" ? "Done" : "تم", coupon });
});

export const createCouponImage = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  const { couponId } = req.params;
  const coupon = await couponModel.findById(couponId);

  if (!coupon) {
    return next(
      new Error(
        lang == "EN" ? `Coupon not found!` : "عفوا لا يوجد كوبون بهذا الاسم",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }

  if (coupon.image?.length > 0) {
    const fullPath = path.join(
      __dirname,
      `./../../../uploads/coupon/${req.imageFolderName}`
    );
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    return next(
      new Error(
        lang == "EN"
          ? `Coupon already has an image, please delete it first!`
          : "عفوا يوجد صورة بالفعل لهذا الكوبون , برجاء حذفها اولا",
        { cause: { code: 409, customCode: 1011 } }
      )
    );
  }

  coupon.image = req.file.dest;
  coupon.imageFolderName = req.file.uniqueFolder;
  await coupon.save();
  console.log(coupon.image);
  return res.json({ message: lang == "EN" ? "Done" : "تم", coupon });
});

export const deleteCouponImage = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  const { couponId } = req.params;
  const coupon = await couponModel.findById(couponId);

  if (!coupon) {
    return next(
      new Error(
        lang == "EN" ? `Coupon not found!` : "عفوا لا يوجد كوبون بهذا الاسم",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }

  if (coupon.image?.length < 1) {
    return next(
      new Error(
        lang == "EN" ? `No image to delete!` : "عفوا لا يوجد صورة لحذفها",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }

  const fullPath = path.join(
    __dirname,
    `./../../../uploads/coupon/${coupon.imageFolderName}`
  );
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }

  coupon.image = "";
  coupon.imageFolderName = "";
  await coupon.save();

  return res.json({ message: lang == "EN" ? "Done" : "تم", coupon });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  let { name, expire } = req.body;

  if (name) {
    name = name.toLowerCase();
    if (await couponModel.findOne({ name })) {
      return next(
        new Error(
          lang == "EN" ? `Coupon already existed` : "اسم الكوبون موجود بالفعل",
          { cause: { code: 409, customCode: 1011 } }
        )
      );
    }
    // if (coupon.name == name) {
    //   return next(
    //     new Error(
    //       lang == "EN"
    //         ? `Sorry cannot update coupon with the same name!`
    //         : "عفوا لا يمكنك تغيير اسم الكوبون بنفس الاسم!",
    //       { cause: { code: 409, customCode: 1011 } }
    //     )
    //   );
    // }
  }

  const coupon = await couponModel.findByIdAndUpdate(
    req.params.couponId,
    {
      ...req.body,
      expire: new Date(expire),
      updatedBy: req.user._id,
    },
    { new: true }
  );
  if (!coupon) {
    return next(
      new Error(
        lang == "EN" ? `Coupon not found!` : "عفوا لا يوجد كوبون بهذا الاسم",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }

  return res
    .status(200)
    .json({ message: lang == "EN" ? "Done" : "تم", coupon });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  const { couponId } = req.params;
  const coupon = await couponModel.findByIdAndDelete(couponId);

  if (!coupon) {
    return next(
      new Error(
        lang == "EN" ? `Coupon not found!` : "عفوا لا يوجد كوبون بهذا الاسم",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }

  const fullPath = path.join(
    __dirname,
    `./../../../uploads/coupon/${coupon.imageFolderName}`
  );
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }

  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});

// TODO: Check expire data when uploading image or updating
