import { asyncHandler } from "../../../utils/errorHandling.js";
import Medicine from "./../../../../DB/model/medicine.model.js";
import Category from "./../../../../DB/model/Category.model.js";
import Brand from "./../../../../DB/model/Brand.model.js";
import slugify from "slugify";
import path from "path";
import { fileURLToPath } from "url";
import { unlink } from "node:fs/promises";
import _ from "underscore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createMedicine = asyncHandler(async (req, res, next) => {
  const { name, category, brand, mainPrice, discountPercent, sideEffects } =
    req.body;
  // check medicine existence
  if (
    await Medicine.findOne({
      $or: [{ "name.EN": name.EN }, { "name.AR": name.AR }],
    })
  )
    return next(new Error(`Duplicate medicine name!`, { cause: 409 }));

  // check category existence
  if (!(await Category.findById(category)))
    return next(new Error(`Category not found!`, { cause: 404 }));

  // check brand existence
  if (!(await Brand.findById(brand)))
    return next(new Error(`Brand not found!`, { cause: 404 }));

  const medicine = await Medicine.create({
    ...req.body,
    slug: slugify(name.EN),
    salePrice: mainPrice - (mainPrice * discountPercent || 0) / 100,
    images: req.files.map((file) => file.dest),
    createdBy: req.user._id,
    sideEffects: _.uniq(sideEffects),
  });

  return res.status(201).json({ message: "Done", medicine });
});

export const updateMedicine = asyncHandler(async (req, res, next) => {
  const { category, brand, mainPrice, discountPercent, sideEffects } = req.body;

  // check category existence
  if (category && !(await Category.findById(category)))
    return next(new Error(`Category not found!`, { cause: 404 }));

  // check brand existence
  if (brand && !(await Brand.findById(brand)))
    return next(new Error(`Brand not found!`, { cause: 404 }));

  let medicine = await Medicine.findByIdAndUpdate(req.params.id, {
    ...req.body,
    $push: {
      updatedBy: {
        id: req.user._id,
        date: Date.now(),
      },
    },
    sideEffects: sideEffects && _.uniq(sideEffects),
  });

  if (!medicine) return next(new Error("Invalid medicine id!", { cause: 400 }));

  medicine.salePrice =
    mainPrice || discountPercent
      ? (mainPrice || medicine.mainPrice) -
        ((mainPrice || medicine.mainPrice) *
          (discountPercent || medicine.discountPercent || 0)) /
          100
      : medicine.salePrice;

  await medicine.save();

  return res.json({ message: "Done", medicine });
});

export const deleteMedicineImage = asyncHandler(async (req, res, next) => {
  let medicine = await Medicine.findByIdAndUpdate(req.params.id, {
    $pull: { images: req.body.dest },
  });
  if (!medicine) return next(new Error("Invalid medicine id!", { cause: 400 }));

  await unlink(path.join(__dirname, `./../../../${req.body.dest}`));

  return res.json({ message: "Done" });
});

export const addMedicineImage = asyncHandler(async (req, res, next) => {
  let medicine = await Medicine.findById(req.params.id);
  if (!medicine) return next(new Error("Invalid medicine id!", { cause: 400 }));

  medicine.images.push(req.file.dest);

  await medicine.save();

  return res.json({ message: "Done", medicine });
});

export const deleteMedicine = asyncHandler(async (req, res, next) => {
  let medicine = await Medicine.findByIdAndDelete(req.params.id);
  if (!medicine) return next(new Error("Invalid medicine id!", { cause: 400 }));

  medicine.images.forEach(async (image) => {
    await unlink(path.join(__dirname, `./../../../${image}`));
  });

  return res.json({ message: "Done" });
});

export const getMedicines = asyncHandler(async (req, res, next) => {
  const { categoryId, brandId } = req.params;
  if (categoryId) {
    if (!(await Category.findById(categoryId)))
      return next(new Error("Category not found!", { cause: 404 }));

    const medicines = await Medicine.find({ category: categoryId });
    return res.json({ message: "Done", medicines });
  }

  if (brandId) {
    if (!(await Brand.findById(brandId)))
      return next(new Error("Brand not found!", { cause: 404 }));

    const medicines = await Medicine.find({ brand: brandId });
    return res.json({ message: "Done", medicines });
  }

  const medicines = await Medicine.find();
  return res.json({ message: "Done", medicines });
});

export const singleMedicine = asyncHandler(async (req, res, next) => {
  let medicine = await Medicine.findById(req.params.id);
  if (!medicine) return next(new Error("Invalid medicine id!", { cause: 400 }));
  return res.json({ message: "Done", medicine });
});
