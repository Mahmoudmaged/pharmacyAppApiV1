import slugify from 'slugify';
import categoryModel from '../../../../DB/model/Category.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import brandModel from '../../../../DB/model/Brand.model.js';

export const getCategoryList = asyncHandler(async (req, res, next) => {
    const categories = await categoryModel.find().populate([
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
    return res.status(200).json({ message: 'Done', categories })
})

export const getCategoryById = asyncHandler(async (req, res, next) => {
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

    return category ? res.status(200).json({ message: 'Done', category }) : next(new Error(`In-valid category Id`, { cause: 400 }))
})


export const createCategory = asyncHandler(async (req, res, next) => {
    const { name, description, brandIds } = req.body;
    if (
        await categoryModel.findOne({
            $or: [
                { "name.EN": name.EN },
                { "name.AR": name.AR },

            ]
        })
    ) {
        return next(new Error(`Duplicate category name`, { cause: 409 }))
    }



    if (brandIds?.length) {
        for (const [index, id] of brandIds.entries()) {
            if (!await brandModel.findById(id)) {
                return next(new Error(`In-valid brand`, { cause: 400 }))
            }
        }
    }

    const category = await categoryModel.create({
        name,
        slug: slugify(name.EN),
        description,
        brandIds,
        image: req.file.dest,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: 'Done', category })
})

export const updateCategory = asyncHandler(async (req, res, next) => {

    const category = await categoryModel.findById(req.params.categoryId)
    if (!category) {
        return next(new Error(`In-valid category Id`, { cause: 400 }))
    }

    if (req.body.name) {
        if (req.body?.name?.AR) {
            if (category.name.AR == req.body.name.AR.toLowerCase()) {
                return next(new Error(`Sorry cannot update category with the old AR name:${req.body.name.AR}`, { cause: 400 }))
            }
        }

        if (req.body?.name?.EN) {
            if (category.name.EN == req.body.name.EN.toLowerCase()) {
                return next(new Error(`Sorry  cannot update category with the old EN name:${req.body.name.EN}`, { cause: 400 }))
            }

            category.slug = slugify(req.body.name.EN);
        }


        if (await categoryModel.findOne({
            $or: [
                { "name.EN": req.body.name.EN },
                { "name.AR": req.body.name.AR },
            ]
        })) {
            return next(new Error(`Duplicate category name`, { cause: 409 }))
        }

        category.name = {
            AR: req.body.name?.AR ? req.body.name?.AR : category.name.AR,
            EN: req.body.name?.EN ? req.body.name?.EN : category.name.EN
        }
    }


    category.description.AR = req.body.description?.AR ? req.body.description?.AR : category.description.AR;
    category.description.EN = req.body.description?.EN ? req.body.description?.EN : category.description.EN;


    if (req.body.brandIds?.length) {
        for (const [index, id] of req.body.brandIds.entries()) {
            if (!await brandModel.findById(id)) {
                return next(new Error(`In-valid brand`, { cause: 400 }))
            }
        }
    }
    category.brandIds = req.body?.brandIds?.length ? req.body.brandIds : category.brandIds;


    if (req.file) {
        category.image = req.file.dest
    }


    category.updatedBy = req.user._id
    await category.save()

    return res.status(200).json({ message: 'Done', category })
})

export const addBrandItem = asyncHandler(async (req, res, next) => {


    const { brandIds } = req.body
    const category = await categoryModel.findOneAndUpdate(req.params.categoryId)
    if (!category) {
        return next(new Error(`In-valid category Id`, { cause: 400 }))
    }

    if (brandIds?.length) {
        for (const [index, id] of brandIds.entries()) {
            if (!await brandModel.findById(id)) {
                return next(new Error(`In-valid brand`, { cause: 400 }))
            }
        }
    }

    const updatedCategory = await categoryModel.findOneAndUpdate({ _id: category._id }, { $addToSet: { brandIds: brandIds } }, { new: true })

    return res.status(200).json({ message: 'Done', category: updatedCategory })
})

export const removeBrandItems = asyncHandler(async (req, res, next) => {

    const { categoryId } = req.params;
    const { brandIds } = req.body
    const category = await categoryModel.findOneAndUpdate({ _id: categoryId }, { $pull: { brandIds: { $in: brandIds } } }, { new: true })
    if (!category) {
        return next(new Error(`In-valid category Id`, { cause: 400 }))
    }
    return res.status(200).json({ message: 'Done', category })
})