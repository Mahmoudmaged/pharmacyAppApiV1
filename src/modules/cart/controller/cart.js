
import cartModel from "../../../../DB/model/Cart.model.js";
import medicineModel from "../../../../DB/model/medicine.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


export const getCartData = async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    //Check cart exist
    const cart = await cartModel.findOne({ userId: req.user._id }).populate([
        {
            path: 'products.productId',
            
        }
    ])

    return res.status(200).json({ message: lang == "EN" ? "Done" : "تم", cart })
}
export const createCart = async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { productId, quantity } = req.body;

    //check Product availability
    const product = await medicineModel.findById(productId)
    console.log({ product });
    if (!product || product.isDeleted) {
        return next(new Error(lang == "EN" ? 'In-valid product ID' : "لم يتم العثور علي هذا المنتج", { cause: { code: 404, customCode: 1004 } }));
    }


    //Check cart exist
    const cart = await cartModel.findOne({ userId: req.user._id })

    //if not exist create new one
    if (!cart) {
        const newCart = await cartModel.create({
            userId: req.user._id,
            products: [{ productId, quantity }]
        })
        return res.status(201).json({ message: lang == "EN" ? "Done" : "تم", cart: newCart })
    }

    // if exist   
    // option 1- update old item
    let matchProduct = false
    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].productId.toString() == productId) {
            cart.products[i].quantity = quantity
            matchProduct = true
            break;
        }
    }
    //   2- push new item
    if (!matchProduct) {
        cart.products.push({ productId, quantity })
    }

    await cart.save()
    return res.status(200).json({ message: lang == "EN" ? "Done" : "تم", cart })
}



export async function deleteItemsFromCart(productIds, userId) {
    const cart = await cartModel.updateOne({ userId }, {
        $pull: {
            products: {
                productId: { $in: productIds }
            }
        }
    })
    return cart
}

export const deleteItems = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { productIds } = req.body
    const cart = await deleteItemsFromCart(productIds, req.user._id)
    return res.status(200).json({ message: lang == "EN" ? "Done" : "تم", cart })
})

export async function emptyCart(userId) {
    const cart = await cartModel.updateOne({ userId }, { products: [] })
    return cart
}


export const clearCart = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const cart = await emptyCart(req.user._id)
    return res.status(200).json({ message: lang == "EN" ? "Done" : "تم", cart })
})