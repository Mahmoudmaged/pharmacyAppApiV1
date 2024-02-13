import { asyncHandler } from "../../../utils/errorHandling.js";
import Medicine from "./../../../../DB/model/medicine.model.js";
import Category from "./../../../../DB/model/Category.model.js";
import Brand from "./../../../../DB/model/Brand.model.js";
import { formatPrice } from "./../medicine.service.js";
import Variant from "../../../../DB/model/variant.model.js";
import { nanoid } from "nanoid";
import slugify from "slugify";
import path from "path";
import { fileURLToPath } from "url";
import { unlink } from "node:fs/promises";
import fs from 'fs'
import _ from "underscore";
import medicineModel from "./../../../../DB/model/medicine.model.js";
import variantModel from "../../../../DB/model/variant.model.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));


//Create
export const createMedicine = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const {
    name,
    category,
    mainPrice,
    discountPercent,
    brand,
    sideEffects,
    variants
  } = req.body;
  console.log({ bodyData: req.body });
  // check medicine existence
  if (
    await Medicine.findOne({
      $or: [{ "name.EN": name.EN }, { "name.AR": name.AR }],
    })
  ) {
    return next(new Error(lang == "EN" ? `Duplicate medicine name` : "عفوا يوجد بالفعل منتج يحمل نفس الاسم", { cause: { code: 409, customCode: 1011 } }));

  }

  // check category existence
  if (!(await Category.findById(category))) {
    return next(new Error(lang == "EN" ? `In-valid category ` : "عفوا لم يتم العثور علي هذه الفئه", { cause: { code: 404, customCode: 1004 } }))
  }

  // check brand existence
  if (!(await Brand.findById(brand))) {
    return next(new Error(lang == "EN" ? 'In-valid brand ' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));
  }

  const medicine = await Medicine.create({
    ...req.body,
    slug: slugify(name.EN),
    salePrice: formatPrice(
      mainPrice - (mainPrice * discountPercent || 0) / 100
    ),
    // images: req.files.map((file) => file.dest),
    createdBy: req.user._id,
    sideEffects: _.uniq(sideEffects),
    imageFolderName: nanoid(),
  });

  if (variants?.length) {
    for (const variant of variants) {
      if (variant.size || variant.color) {
        await Variant.create({
          medicine: medicine._id,
          size: variant.size || "",
          color: variant.color || "",
          createdBy: req.user._id
        });
      }
    }
  }


  return res.status(201).json({ message: lang == "EN" ? "Done" : "تم", medicine });
});

//general Update
export const updateMedicine = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { medicineId } = req.params
  const { name, category, brand, mainPrice, discountPercent, sideEffects, isDrug, indicationsForUse, dose } = req.body;

  // check medicine existence
  const medicine = await medicineModel.findById(medicineId)
  if (!medicine) return next(new Error(lang == "EN" ? "Invalid medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));

  // check category existence
  if (category && !(await Category.findById(category))) { return next(new Error(lang == "EN" ? `Category not found!` : "عفوا لم يتعم العثور علي هذه الفئه", { cause: { code: 404, cause: 1004 } })); }

  // check brand existence
  if (brand && !(await Brand.findById(brand))) { return next(new Error(lang == "EN" ? `Brand not found!` : "عفوا لا توجد  علامه تجاريه", { cause: { code: 404, customCode: 1004 } })); }


  // check Name
  if (name) {
    if (name?.AR) {
      if (medicine.name.AR == name.AR.toLowerCase()) {
        return next(new Error(
          lang == "EN" ?
            `Sorry cannot update medicine with the old AR name:${name.AR}` :
            `${name.AR}عفو لا يمكن تحديث بنفس الاسم العربي `,
          { cause: { code: 409, customCode: 1011 } }))
      }
    }


    if (name?.EN) {
      if (medicine.name.EN == name.EN.toLowerCase()) {
        return next(new Error(
          lang == "EN" ?
            `Sorry  cannot update medicine with the old EN name:${name.EN}` :
            `${name.EN}عفو لا يمكن تحديث بنفس الاسم الانجليزي `,
          { cause: { code: 409, customCode: 1011 } }))
      }

      medicine.slug = slugify(name.EN);
    }


    if (await medicineModel.findOne({
      $or: [
        { "name.EN": name.EN },
        { "name.AR": name.AR },
      ]
    })) {

      return next(new Error(lang == "EN" ? `Duplicate medicine name` : "يوجد بالفعل منتج يحمل نفس الاسم من قبل", { cause: { code: 409, customCode: 1011 } }))
    }

    medicine.name = {
      AR: name?.AR ? name?.AR : medicine.name.AR,
      EN: name?.EN ? name?.EN : medicine.name.EN
    }
  }

  //check description
  medicine.description = {
    AR: req.body.description?.AR ? req.body.description?.AR : medicine.description.AR,
    EN: req.body.description?.EN ? req.body.description?.EN : medicine.description.EN,
  }

  //mainPrice &  discountPercent & salePrice
  medicine.mainPrice = mainPrice ? mainPrice : medicine.mainPrice;
  medicine.discountPercent = discountPercent ? mainPrice : medicine.discountPercent;
  medicine.salePrice = Number.parseFloat(medicine.mainPrice - (medicine.mainPrice * ((medicine.discountPercent) / 100))).toFixed(2)

  //isDrug
  medicine.isDrug = isDrug ? isDrug : medicine.isDrug;

  // sideEffects
  medicine.sideEffects = sideEffects ? _.uniq(sideEffects) : medicine.sideEffects;

  // indicationsForUse
  medicine.indicationsForUse = indicationsForUse ? _.uniq(indicationsForUse) : medicine.indicationsForUse;

  // dose
  medicine.dose = dose ? _.uniq(dose) : medicine.dose;
  await medicine.save();

  return res.json({ message: lang == "EN" ? "Done" : "تم", medicine });
});

//variant Update & Delete
export const updateMedicineVariant = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { medicineId, variantId } = req.params


  // check medicine existence
  const variant = await variantModel.findOneAndUpdate(
    { _id: variantId, medicine: medicineId },
    { ...req.body, updatedBy: req.user._id },
    { new: true }
  )
  if (!variant) return next(new Error(lang == "EN" ? "Invalid variant or medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));
  return res.json({ message: lang == "EN" ? "Done" : "تم", variant });
});
export const freezeMedicineVariant = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { medicineId, variantId } = req.params
  // check medicine existence
  const variant = await variantModel.findOneAndUpdate(
    { _id: variantId, medicine: medicineId },
    { isDeleted: true, updatedBy: req.user._id },
    { new: true }
  )
  if (!variant) return next(new Error(lang == "EN" ? "Invalid variant or medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));
  return res.json({ message: lang == "EN" ? "Done" : "تم", variant });
});

export const unFreezeMedicineVariant = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { medicineId, variantId } = req.params
  // check medicine existence
  const variant = await variantModel.findOneAndUpdate(
    { _id: variantId, medicine: medicineId },
    { isDeleted: false, updatedBy: req.user._id },
    { new: true }
  )
  if (!variant) return next(new Error(lang == "EN" ? "Invalid variant or medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));
  return res.json({ message: lang == "EN" ? "Done" : "تم", variant });
});

//image Add/Update & Delete
export const deleteMedicineImage = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  let medicine = await Medicine.findByIdAndUpdate(req.params.medicineId, {
    $pull: { images: req.body.dest },
  });
  if (!medicine) return next(new Error(lang == "EN" ? "Invalid medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));

  const fullPath = path.join(__dirname, `./../../../${req.body.dest}`)
  if (fs.existsSync(fullPath)) {
    await unlink(fullPath);
  }
  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});
export const addMedicineImage = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  let medicine = await Medicine.findById(req.params.medicineId);
  if (!medicine) return next(new Error(lang == "EN" ? "Invalid medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));

  for (const file of req.files) {
    medicine.images.push(file.dest);
  }
  medicine.updatedBy = req.user._id
  await medicine.save();
  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});


//freeze / unFreeze medicine
export const freezeMedicine = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  let medicine = await Medicine.findByIdAndUpdate(req.params.medicineId, { isDeleted: true, updatedBy: req.user._id });
  if (!medicine) return next(new Error(lang == "EN" ? "Invalid medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));
  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});

export const unFreezeMedicine = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  let medicine = await Medicine.findByIdAndUpdate(req.params.medicineId, { isDeleted: false, updatedBy: req.user._id });
  if (!medicine) return next(new Error(lang == "EN" ? "Invalid medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));
  return res.json({ message: lang == "EN" ? "Done" : "تم" });
});



//Get & Search
export const getMedicines = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { categoryId, brandId } = req.body;
  if (categoryId & brandId) {
    const medicines = await Medicine.find({ category: categoryId, brand: brandId });
    return res.json({ message: lang == "EN" ? "Done" : "تم", medicines });
  }

  if (categoryId) {
    if (!await Category.findById(categoryId)) { return next(new Error(lang == "EN" ? "Category not found!" : "عفو لم يتم العثور علي هذه الفئه", { cause: { code: 404, customCode: 1004 } })) }
    const medicines = await Medicine.find({ category: categoryId });
    return res.json({ message: lang == "EN" ? "Done" : "تم", medicines });
  }

  if (brandId) {
    if (!await Brand.findById(brandId)) { return next(new Error(lang == "EN" ? "Brand not found!" : "عفو لا توجد هذه العلامه التجاريه", { cause: { code: 404, customCode: 1004 } })); }
    const medicines = await Medicine.find({ brand: brandId });
    return res.json({ message: lang == "EN" ? "Done" : "تم", medicines });
  }

  const medicines = await Medicine.find();
  return res.json({ message: lang == "EN" ? "Done" : "تم", medicines });

});
export const singleMedicine = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  let medicine = await Medicine.findById(req.params.medicineId);
  if (!medicine) return next(new Error(lang == "EN" ? "Invalid medicine id!" : "عفوا لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));
  return res.json({ message: lang == "EN" ? "Done" : "تم", medicine });

});
export const searchMedicine = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { keyword } = req.query;
  const medicines = await Medicine.find({
    $or: [
      { "name.EN": { $regex: keyword, $options: "i" } },
      { "name.AR": { $regex: keyword } },
      { "description.EN": { $regex: keyword, $options: "i" } },
      { "description.AR": { $regex: keyword } },
    ],
  });

  // paginate // TODO
  return res.json({ message: lang == "EN" ? "Done" : "تم", medicines });

});
