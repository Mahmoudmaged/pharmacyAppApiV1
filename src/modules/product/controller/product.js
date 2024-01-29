import subcategoryModel from '../../../../DB/model/Subcategory.model.js'
import branModel from '../../../../DB/model/Brand.model.js'
import slugify from 'slugify';
import cloudinary from '../../../utils/cloudinary.js'
import productModel from '../../../../DB/model/Product.model.js';
import { nanoid } from 'nanoid';
import { asyncHandler } from '../../../utils/errorHandling.js';
import userModel from '../../../../DB/model/User.model.js';
import ApiFeatures from '../../../utils/apiFeatures.js';


export const productList = asyncHandler(async (req, res, next) => {

    const apiFeature = new ApiFeatures(productModel.find().populate([
        {
            path: 'review'
        }
    ]), req.query).paginate().filter().sort().select().search()

    const products = await apiFeature.mongooseQuery;
    for (let i = 0; i < products.length; i++) {
        let calcRating = 0
        for (let j = 0; j < products[i].review.length; j++) {
            calcRating += products[i].review[j].rating
        }
        let avgRating = calcRating / products[i].review.length
        const product = products[i].toObject()
        product.avgRating = avgRating
        products[i] = product
    }
    return res.status(200).json({ message: "Done", products })

})






// 200  50 % => 100
export const createProduct = asyncHandler(async (req, res, next) => {

    const { name, categoryId, subcategoryId, brandId, price, discount } = req.body;

    if (! await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
        return next(new Error(`In-valid category or subcategory Id`, { cause: 400 }))
    }
    if (! await branModel.findOne({ _id: brandId, })) {
        return next(new Error(`In-valid brand Id`, { cause: 400 }))
    }


    req.body.slug = slugify(name, {
        replacement: '-',
        trim: true,
        lower: true
    })

    req.body.finalPrice = Number.parseFloat(price - (price * ((discount || 0) / 100))).toFixed(2)
    // 200 - (200 * (50/100)) => 200 -100 = 100
    // 200 - (200 * (0/100)) => 200 -0 =200

    req.body.customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}` })
    req.body.mainImage = { secure_url, public_id }

    if (req.files.subImages) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }
    }

    req.body.createdBy = req.user._id
    const product = await productModel.create(req.body)
    if (!product) {
        return next(new Error("Fail to create this product", { cause: 400 }))
    }
    return res.status(201).json({ message: "Done", product })
})

export const updateProduct = asyncHandler(async (req, res, next) => {

    //check product exist
    const { productId } = req.params
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error(`In-valid product Id`, { cause: 400 }))
    }
    //destruct main fields
    const { name, categoryId, subcategoryId, brandId, price, discount } = req.body;

    //check category & brand
    if (categoryId && subcategoryId) {
        if (! await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
            return next(new Error(`In-valid category or subcategory Id`, { cause: 400 }))
        }
    }
    if (brandId) {
        if (! await branModel.findOne({ _id: brandId, })) {
            return next(new Error(`In-valid brand Id`, { cause: 400 }))
        }
    }

    //update slug 
    if (name) {
        req.body.slug = slugify(name, {
            replacement: '-',
            trim: true,
            lower: true
        })
    }

    //update price 500  %50 =>250
    //600  %50 = > 300
    // %75 => 150
    if (price && discount) {
        req.body.finalPrice = Number.parseFloat(price - (price * ((discount) / 100))).toFixed(2)
    } else if (price) {
        req.body.finalPrice = Number.parseFloat(price - (price * ((product.discount) / 100))).toFixed(2)
    } else if (discount) {
        req.body.finalPrice = Number.parseFloat(product.price - (product.price * ((discount) / 100))).toFixed(2)
    }

    if (req.files?.mainImage?.length) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${product.customId}` })
        await cloudinary.uploader.destroy(product.mainImage.public_id)

        req.body.mainImage = { secure_url, public_id }
    }

    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }
        // if (product.subImages?.length) {
        //     const oldPublicId = product.subImages.map(ele => {
        //         return ele.public_id
        //     })
        //     await cloudinary.api.delete_resources(oldPublicId)
        // }
    }
    req.body.updatedBy = req.user._id
    await productModel.updateOne({ _id: product._id }, req.body)
    return res.status(200).json({ message: "Done" })
})



// wishlist


export const addToWishlist = asyncHandler(async (req, res, next) => {

    if (!await productModel.findById(req.params.productId)) {
        return next(new Error('In-valid product'))
    }
    await userModel.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: req.params.productId } })

    return res.status(200).json({ message: "Done" })
})

export const removerToWishlist = asyncHandler(async (req, res, next) => {
    await userModel.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } })
    return res.status(200).json({ message: "Done" })
})

