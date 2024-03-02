import slugify from 'slugify';
import categoryModel from '../../../../DB/model/Category.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import brandModel from '../../../../DB/model/Brand.model.js';
import _ from "underscore";
import fs from "fs";
import path from "path";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getCategoryList = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const categories = await categoryModel.find({ isDeleted: false }).populate([
        {
            path: "createdBy"
        },
        {
            path: "brandIds"
        },
        {
            path: "updatedBy"
        },
    ])
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", categories })
})

export const getCategoryById = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const category = await categoryModel.findById(req.params.categoryId).populate([
        {
            path: "createdBy"
        },
        {
            path: "brandIds"
        },
        {
            path: "updatedBy"
        },
    ])

    return category ? res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", category }) :
        next(new Error(lang == "EN" ? `In-valid category Id` : "عفوا لم يتم العثور علي هذه الفئه", { cause: { code: 404, customCode: 1004 } }))

})


export const createCategory = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { name, description } = req.body;


    let brandIds = req.body.brandIds?.split(",");

    if (
        await categoryModel.findOne({
            $or: [
                { "name.EN": name.EN },
                { "name.AR": name.AR },

            ]
        })
    ) {
        return next(new Error(lang == "EN" ? `Duplicate category name` : "يوجد بالفعل فئه تحمل نفس العنوان من قبل", { cause: { code: 409, customCode: 1011 } }))

    }



    if (brandIds?.length) {
        for (const [index, id] of brandIds.entries()) {
            if (!await brandModel.findById(id)) {
                return next(new Error(
                    lang == "EN" ?
                        'In-valid brand ID' : "لم يتم العثور علي  العلامه التجاريه",
                    { cause: { code: 404, customCode: 1004 } }));
            }
        }
    }

    const category = await categoryModel.create({
        name,
        slug: slugify(name.EN),
        description,
        brandIds: _.uniq(brandIds),
        image: req.file.dest,
        imageFolderName: req.imageFolderName,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: lang == "EN" ? 'Done' : "تم", category })
})

export const updateCategory = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const category = await categoryModel.findById(req.params.categoryId)
    if (!category) {
        return next(new Error(lang == "EN" ? `In-valid category Id` : "عفوا لم يتم العثور علي هذه الفئه", { cause: { code: 404, customCode: 1004 } }))
    }

    if (req.body.name) {
        if (req.body?.name?.AR) {
            if (category.name.AR == req.body.name.AR.toLowerCase()) {
                return next(new Error(
                    lang == "EN" ?
                        `Sorry cannot update category with the old AR name:${req.body.name.AR}` :
                        `${req.body.name.AR}عفو لا يمكن تحديث بنفس الاسم العربي `,
                    { cause: { code: 409, customCode: 1011 } }))
            }
        }

        if (req.body?.name?.EN) {
            if (category.name.EN == req.body.name.EN.toLowerCase()) {
                return next(new Error(
                    lang == "EN" ?
                        `Sorry  cannot update category with the old EN name:${req.body.name.EN}` :
                        `${req.body.name.EN}عفو لا يمكن تحديث بنفس الاسم الانجليزي `,
                    { cause: { code: 409, customCode: 1011 } }))
            }

            category.slug = slugify(req.body.name.EN);
        }


        if (await categoryModel.findOne({
            $or: [
                { "name.EN": req.body.name.EN },
                { "name.AR": req.body.name.AR },
            ]
        })) {

            return next(new Error(lang == "EN" ? `Duplicate category name` : "يوجد بالفعل فئه تحمل نفس العنوان من قبل", { cause: { code: 409, customCode: 1011 } }))
        }

        category.name = {
            AR: req.body.name?.AR ? req.body.name?.AR : category.name.AR,
            EN: req.body.name?.EN ? req.body.name?.EN : category.name.EN
        }
    }


    category.description.AR = req.body.description?.AR ? req.body.description?.AR : category.description.AR;
    category.description.EN = req.body.description?.EN ? req.body.description?.EN : category.description.EN;


    let brandIds = req.body.brandIds?.split(",");
    if (brandIds?.length) {
        for (const [index, id] of brandIds.entries()) {
            if (!await brandModel.findById(id)) {
                return next(new Error(lang == "EN" ? 'In-valid brand ID' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));
            }
        }
    }
    category.brandIds = brandIds?.length ? _.uniq(brandIds) : category.brandIds;


    if (req.file) {
        if (category.image) {
            const fullPath = path.join(__dirname, `./../../../${category.image}`)
            if (fs.existsSync(fullPath)) {
                await unlink(fullPath);
            }
        }
        category.image = req.file.dest
    }


    category.updatedBy = req.user._id
    await category.save()

    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", category })
})

export const addBrandItem = asyncHandler(async (req, res, next) => {

    const lang = req.headers.lang || "EN";
    const { brandIds } = req.body
    const category = await categoryModel.findOneAndUpdate(req.params.categoryId)
    if (!category) {
        return next(new Error(lang == "EN" ? `In-valid category Id` : "عفوا لم يتم العثور علي هذه الفئه", { cause: { code: 404, customCode: 1004 } }))
    }

    if (brandIds?.length) {
        for (const [index, id] of brandIds.entries()) {
            if (!await brandModel.findById(id)) {
                return next(new Error(lang == "EN" ? 'In-valid brand ID' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));
            }
        }
    }

    const updatedCategory = await categoryModel.findOneAndUpdate({ _id: category._id }, { $addToSet: { brandIds: brandIds } }, { new: true })

    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", category: updatedCategory })
})

export const removeBrandItems = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const { categoryId } = req.params;
    const { brandIds } = req.body
    const category = await categoryModel.findOneAndUpdate({ _id: categoryId }, { $pull: { brandIds: { $in: brandIds } } }, { new: true })
    if (!category) {
        return next(new Error(lang == "EN" ? `In-valid category Id` : "عفوا لم يتم العثور علي هذه الفئه", { cause: { code: 404, customCode: 1004 } }))
    }
    return res.status(200).json({ message: 'Done', category })
})


//TODO not remove when it has product
export const deleteCategory = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { categoryId } = req.params;
    const category = await categoryModel.findOneAndUpdate({ _id: categoryId }, { isDeleted: true, updatedBy: req.user._id }, { new: true })
    if (!category) {
        return next(new Error(lang == "EN" ? `In-valid category Id` : "عفوا لم يتم العثور علي هذه الفئه", { cause: { code: 404, customCode: 1004 } }))
    }
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", category })
})