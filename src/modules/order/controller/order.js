import couponModel from "../../../../DB/model/Coupon.model.js";
import orderModel, { orderStatus } from "../../../../DB/model/Order.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { deleteItemsFromCart, emptyCart } from "../../cart/controller/cart.js";
import { createInvoice } from "../../../utils/pdf.js";
import sendEmail from "../../../utils/email.js";
import payment from "../../../utils/payment.js";
// import payment from '../../../utils/newPayment.js';

import Stripe from "stripe";
import medicineModel from "../../../../DB/model/medicine.model.js";

// Done
export const createOrder = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";

  const { address, phone, note, couponName, paymentType } = req.body;

  if (!req.body.products) {
    const cart = await cartModel.findOne({ userId: req.user._id });
    if (!cart?.products?.length) {
      return next(
        new Error(lang == "EN" ? `empty cart` : "عفوا ولكن عربه التسوق فارغه", {
          cause: { code: 409, customCode: 1011 },
        })
      );
    }
    req.body.isCart = true;
    req.body.products = cart.products;
  }

  if (couponName) {
    const coupon = await couponModel.findOne({
      name: couponName.toLowerCase(),
      usedBy: { $nin: req.user._id },
    });
    if (!coupon || coupon.expire.getTime() < Date.now()) {
      return next(
        new Error(
          lang == "EN"
            ? `In-valid or expired coupon`
            : "لا يوجد كوبون بهذا الاسم",
          { cause: { code: 404, customCode: 1015 } }
        )
      );
    }
    req.body.coupon = coupon;
  }

  const productIds = [];
  const finalProductList = [];
  let subtotal = 0;
  let containDrug;

  for (let product of req.body.products) {
    const checkedProduct = await medicineModel.findOne({
      _id: product.productId,
      isDeleted: false,
    });

    if (!checkedProduct) {
      return next(
        new Error(
          lang == "EN"
            ? ` product  with id ${checkedProduct._id} not found!`
            : "خطا فى رقم المنتج",
          { cause: { code: 404, customCode: 1015 } }
        )
      );
    }

    if (checkedProduct.isDrug) {
      if (!req.file) {
        return next(
          new Error(
            lang == "EN"
              ? `  ${checkedProduct.name} product is a drug, you must upload the prescription!`
              : `لابد من رفع الروشتة لمنتج ${checkedProduct.name}`,
            { cause: { code: 400, customCode: 1017 } }
          )
        );
      } else {
        containDrug = true;
      }
    }
    if (req.body.isCart) {
      // product  = > BSOn object
      product = product.toObject();
    }
    productIds.push(product.productId);
    product.name = checkedProduct.name;
    product.unitPrice = checkedProduct.salePrice;
    product.finalPrice = product.quantity * checkedProduct.salePrice.toFixed(2);
    finalProductList.push(product);
    subtotal += product.finalPrice;
  }

  const order = await orderModel.create({
    userId: req.user._id,
    note,
    products: finalProductList,
    subtotal,
    finalPrice:
      subtotal -
      (
        subtotal *
        (((req.body.coupon?.amount && !containDrug) || 0) / 100)
      ).toFixed(2),
    ...(!containDrug && {
      address,
      phone,
      paymentType,
      couponId: req.body.coupon?._id,
    }),
    ...(containDrug && {
      status: orderStatus.dummy,
      prescription: req.file.dest,
    }),
  });

  if (containDrug) {
    // send notification to system
  } else {
    //push user id in  coupon usedBy
    if (req.body.coupon) {
      await couponModel.updateOne(
        { _id: req.body.coupon._id },
        { $addToSet: { usedBy: req.user._id } }
      );
    }
    // clear items cart
    if (req.body.isCart) {
      await emptyCart(req.user._id);
    } else {
      await deleteItemsFromCart(productIds, req.user._id);
    }
  }

  return res.status(201).json({ message: lang == "EN" ? "Done" : "تم", order });
});

// Done
export const confirmDummyOrder = asyncHandler(async (req, res, next) => {
  const { address, phone, couponName, paymentType, note } = req.body;
  const { orderId } = req.params;

  const order = await orderModel.findById(orderId);
  if (!order) {
    return next(
      new Error(
        lang == "EN"
          ? ` order  with id ${order._id} not found!`
          : "لا يوجد طلب بهذا الرقم!",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }

  const orderDate = new Date(order.createdAt);
  if (isExpired(orderDate)) {
    order.status = orderStatus.closedDummy;
    return next(
      new Error(
        lang == "EN"
          ? ` order with id ${order._id} exceeded the allowed time!`
          : "هذا الطلب تخطى الوقت المسوح به للقبول",
        { cause: { code: 400, customCode: 1017 } }
      )
    );
  }

  if (couponName) {
    const coupon = await couponModel.findOne({
      name: couponName.toLowerCase(),
      usedBy: { $nin: req.user._id },
    });
    if (!coupon || coupon.expire.getTime() < Date.now()) {
      return next(
        new Error(
          lang == "EN"
            ? `In-valid or expired coupon`
            : "لا يوجد كوبون بهذا الاسم",
          { cause: { code: 404, customCode: 1015 } }
        )
      );
    }
    req.body.coupon = coupon;
  }

  order.address = address;
  order.phone = phone;
  order.couponId = req.body.coupon?._id;
  finalPrice =
    subtotal -
    (order.subtotal * ((req.body.coupon?.amount || 0) / 100)).toFixed(2);
  if (paymentType) order.paymentType = paymentType;
  if (note) order.note = note;
  order.status = orderStatus.placed;

  await order.save();
});

// Done
export const allUserOrders = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { dummy } = req.query; // true

  let orders;
  orders = dummy
    ? await orderModel.find({ userId: req.user._id })
    : await orderModel.find({
        userId: req.user._id,
        status: orderStatus.dummy,
      });
  return res
    .status(200)
    .json({ message: lang == "EN" ? "Done" : "تم", orders });
});

// Done
export const allOrders = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { dummy } = req.query; // true

  let orders;
  orders = dummy
    ? await orderModel.find({})
    : await orderModel.find({
        status: orderStatus.dummy,
      });
  return res
    .status(200)
    .json({ message: lang == "EN" ? "Done" : "تم", orders });
});

// Done
export const singleOrder = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";
  const { orderId } = req.params;

  const order = await orderModel.findById(orderId);

  if (!order) {
    return next(
      new Error(
        lang == "EN"
          ? ` order  with id ${order._id} not found!`
          : "لا يوجد طلب بهذا الرقم!",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }

  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم", order });
});

// Done
export const updateOrderStatusByAdmin = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const lang = req.headers.lang || "EN";

  const order = await orderModel.findById(orderId);

  if (!order) {
    return next(
      new Error(
        lang == "EN"
          ? ` order  with id ${order._id} not found!`
          : "لا يوجد طلب بهذا الرقم!",
        { cause: { code: 404, customCode: 1015 } }
      )
    );
  }
  order.status = status;
  order.updatedBy = req.user._id;
  await order.save();

  return res.status(200).json({ message: lang == "EN" ? "Done" : "تم", order });
});
