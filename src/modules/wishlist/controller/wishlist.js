
import medicineModel from '../../../../DB/model/medicine.model.js';
import wishlistModel from '../../../../DB/model/wishlist.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';

export const getWishlist = asyncHandler(async (req, res, next) => {
    const lang = req.headers?.lang || 'EN'
    const wishlist = await wishlistModel.findOne({ userId: req.user._id }).populate("products")
    return res.json({ message: lang == "EN" ? 'Done' : "تم", wishlist })
})

export const add = asyncHandler(async (req, res, next) => {

    const lang = req.headers?.lang || 'EN'
    const { medicineId } = req.params;
    if (!await medicineModel.findById(medicineId)) {
        return next(new Error(lang == "EN" ? "Not found" : "عفو لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }))
    }
    const wishlist = await wishlistModel.findOneAndUpdate({ userId: req.user._id }, {
        $addToSet: { products: medicineId }
    }, { new: true })

    if (!wishlist) {
        const newWishlist = await wishlistModel.create({
            userId: req.user._id,
            products: [medicineId]
        })
        return res.status(201).json({ message: lang == "EN" ? 'Done' : "تم", wishlist: newWishlist })
    }
    return res.json({ message: lang == "EN" ? 'Done' : "تم", wishlist })
})

export const remove = asyncHandler(async (req, res, next) => {

    const lang = req.headers?.lang || 'EN'

    const wishlist = await wishlistModel.findOneAndUpdate({ userId: req.user._id }, {
        $pull: { products: req.params.medicineId }
    })

    return res.json({ message: lang == "EN" ? 'Done' : "تم", wishlist })
})






