import slugify from 'slugify';
import brandModel from '../../../../DB/model/Brand.model.js';
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from '../../../utils/errorHandling.js';

export const getBrandList = asyncHandler(async (req, res, next) => {
    const brand = await brandModel.find().populate([
        {
            path: "createdBy"
        },
        {
            path: "updatedBy"
        },
    ])
    return res.status(200).json({ message: 'Done', brands: brand })
})

export const getBrandById = asyncHandler(async (req, res, next) => {
    const brand = await brandModel.findById(req.params.brandId).populate([
        {
            path: "createdBy"
        },
        {
            path: "updatedBy"
        },
    ])
    return res.status(200).json({ message: 'Done', brand })
})


export const createBrand = asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    if (
        await brandModel.findOne({
            $or: [
                { "name.EN": name.EN },
                { "name.AR": name.AR },

            ]
        })
    ) {
        return next(new Error(`Duplicate brand name`, { cause: 409 }))
    }

    const brand = await brandModel.create({
        name,
        slug: slugify(name.EN),
        image: req.file.dest,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: 'Done', brand })
})

export const updateBrand = asyncHandler(async (req, res, next) => {

    const brand = await brandModel.findById(req.params.brandId)
    if (!brand) {
        return next(new Error(`In-valid brand Id`, { cause: 400 }))
    }

    if (req.body.name) {
        if (req.body?.name?.AR) {
            if (brand.name.AR == req.body.name.AR.toLowerCase()) {
                return next(new Error(`Sorry cannot update brand with the old AR name:${req.body.name.AR}`, { cause: 400 }))
            }
        }

        if (req.body?.name?.EN) {
            if (brand.name.EN == req.body.name.EN.toLowerCase()) {
                return next(new Error(`Sorry  cannot update brand with the old EN name:${req.body.name.EN}`, { cause: 400 }))
            }
            brand.slug = req.body.name?.EN ? slugify(req.body.name.EN) : brand.slug.EN;
        }


        if (await brandModel.findOne({
            $or: [
                { "name.EN": req.body.name.EN },
                { "name.AR": req.body.name.AR },
            ]
        })) {
            return next(new Error(`Duplicate brand name`, { cause: 409 }))
        }

        brand.name = {
            AR: req.body.name?.AR ? req.body.name?.AR : brand.name.AR,
            EN: req.body.name?.EN ? req.body.name?.EN : brand.name.EN
        }

    }

    if (req.file) {
        brand.image = req.file.dest
    }

    brand.updatedBy = req.user._id
    await brand.save()

    return res.status(200).json({ message: 'Done', brand })
})