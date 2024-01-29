import { nanoid } from 'nanoid';
import slugify from 'slugify';
import categoryModel from '../../../../DB/model/Category.model.js';
import subcategoryModel from '../../../../DB/model/Subcategory.model.js';
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from '../../../utils/errorHandling.js';

export const getSubcategory = asyncHandler(async (req, res, next) => {
    const subcategory = await subcategoryModel.find().populate([
        {
            path: 'categoryId'
        }
    ])
    return res.status(200).json({ message: 'Done', subcategory })
})


export const createSubcategory = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    console.log(categoryId);
    if (!await categoryModel.findById(categoryId)) {
        return next(new Error(`In-valid category Id`, { cause: 400 }))
    }

    const name = req.body.toLowerCase();
    if (await subcategoryModel.findOne({ name })) {
        return next(new Error(`Duplicate subcategory name ${name}`, { cause: 409 }))
    }
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
        { folder: `${process.env.APP_NAME}/category/${categoryId}/${customId}` })
    const subcategory = await subcategoryModel.create({
        name,
        slug: slugify(name, '-'),
        image: { secure_url, public_id },
        categoryId,
        customId,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: 'Done', subcategory })
})

export const updateSubcategory = asyncHandler(async (req, res, next) => {
    const { categoryId, subcategoryId } = req.params

    const subcategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryId })
    if (!subcategory) {
        return next(new Error(`In-valid subcategory Id`, { cause: 400 }))
    }

    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase()
        if (subcategory.name == req.body.name) {
            return next(new Error(`Sorry  cannot update subcategory with the same name`, { cause: 400 }))
        }
        if (await subcategoryModel.findOne({ name: req.body.name })) {
            return next(new Error(`Duplicate subcategory name ${req.body.name}`, { cause: 409 }))
        }

        subcategory.name = req.body.name;
        subcategory.slug = slugify(req.body.name, '-')
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category/${categoryId}/${subcategory.customId}` })
        await cloudinary.uploader.destroy(subcategory.image.public_id)
        subcategory.image = { secure_url, public_id }
    }
    subcategory.updatedBy = req.user._id
    await subcategory.save()
    return res.status(200).json({ message: 'Done', subcategory })
})