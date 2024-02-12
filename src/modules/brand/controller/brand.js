import slugify from 'slugify';
import brandModel from '../../../../DB/model/Brand.model.js';
import fs from "fs";
import path from "path";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "url";
import { asyncHandler } from '../../../utils/errorHandling.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export const getBrandList = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const brand = await brandModel.find({ isDeleted: false }).populate([
        {
            path: "createdBy"
        },
        {
            path: "updatedBy"
        },
    ])
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", brands: brand })
})

export const getBrandById = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const brand = await brandModel.findById(req.params.brandId).populate([
        {
            path: "createdBy"
        },
        {
            path: "updatedBy"
        },
    ])

    return brand ?
        res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", brand }) :
        next(new Error(lang == "EN" ? 'In-valid brand ID' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));
})


export const createBrand = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { name } = req.body;
    if (
        await brandModel.findOne({
            $or: [
                { "name.EN": name.EN },
                { "name.AR": name.AR },

            ]
        })
    ) {
        return next(new Error(lang == "EN" ? `Duplicate brand name` : "عفوا يوجد بالفعل علامه تجاريه مسجله بهذا الاسم", { cause: { code: 409, customCode: 1011 } }))
    }

    const brand = await brandModel.create({
        name,
        slug: slugify(name.EN),
        image: req.file.dest,
        imageFolderName: req.imageFolderName,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: lang == "EN" ? 'Done' : "تم", brand })
})

export const updateBrand = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const brand = await brandModel.findById(req.params.brandId)

    if (!brand) {
        return next(new Error(lang == "EN" ? 'In-valid brand ID' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));

    }
    if (req.body.name) {
        if (req.body?.name?.AR) {
            if (brand.name.AR == req.body.name.AR.toLowerCase()) {
                return next(new Error(
                    lang == "EN" ? `Sorry cannot update brand with the old AR name:${req.body.name.AR}` : ` ${req.body.name.AR}لا يمكن تحديث  بنفس الاسم العربي`
                    , { cause: { code: 409, customCode: 1011 } }))
            }
        }

        if (req.body?.name?.EN) {
            if (brand.name.EN == req.body.name.EN.toLowerCase()) {
                return next(new Error(
                    lang == "EN" ? `Sorry  cannot update brand with the old EN name:${req.body.name.EN}` : ` ${req.body.name.EN}لا يمكن تحديث  بنفس الاسم الانجليزي`,
                    { cause: { code: 409, customCode: 1011 } }))
            }
            brand.slug = req.body.name?.EN ? slugify(req.body.name.EN) : brand.slug.EN;
        }


        if (await brandModel.findOne({
            $or: [
                { "name.EN": req.body.name.EN },
                { "name.AR": req.body.name.AR },
            ]
        })) {
            return next(new Error(lang == "EN" ? `Duplicate brand name` : "عفوا يوجد بالفعل علامه تجاريه مسجله بهذا الاسم", { cause: { code: 409, customCode: 1011 } }))
        }

        brand.name = {
            AR: req.body.name?.AR ? req.body.name?.AR : brand.name.AR,
            EN: req.body.name?.EN ? req.body.name?.EN : brand.name.EN
        }

    }
    if (req.file) {
        if (brand.image) {
            const fullPath = path.join(__dirname, `./../../../${brand.image}`)
            if (fs.existsSync(fullPath)) {
                await unlink(fullPath);
            }
        }
        brand.image = req.file.dest
    }

    brand.updatedBy = req.user._id
    await brand.save()

    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", brand })
})

export const deleteBrand = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const brand = await brandModel.findByIdAndUpdate(req.params.brandId, { isDeleted: true, updatedBy: req.user._id }, { new: true })
    if (!brand) {
        return next(new Error(lang == "EN" ? 'In-valid brand ID' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));
    }
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", brand })
})