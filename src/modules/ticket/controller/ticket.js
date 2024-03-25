import medicineModel from "../../../../DB/model/medicine.model.js";
import ticketModel from "../../../../DB/model/ticket.model.js";
import { asyncHandler } from "./../../../utils/errorHandling.js";

export const openTicketText = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const lang = req.headers?.lang || "EN";

  const ticket = await ticketModel.create({
    text,
    user: req.user._id,
  });

  // send notification to system

  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    ticket,
  });
});

export const openTicketFile = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";

  const ticket = await ticketModel.create({
    file: req.file.dest,
    user: req.user._id,
  });

  // send notification to system

  return res.json({
    message: lang == "EN" ? "Done" : "تم",
    ticket,
  });
});

export const ticketToOrder = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";

  const { products } = req.body;
  const { ticketId } = req.params;

  const ticket = await ticketModel.findById(ticketId);
  const userId = ticket.user;
  const productIds = [];
  const finalProductList = [];
  let subtotal = 0;

  for (let product of products) {
    const checkedProduct = await medicineModel.findOne({
      _id: product.productId,
      isDeleted: false,
    });

    if (!checkedProduct) {
      return next(
        new Error(
          lang == "EN"
            ? ` product  with id ${product.productId} not found!`
            : "خطا فى رقم المنتج",
          { cause: { code: 404, customCode: 1015 } }
        )
      );
    }

    productIds.push(product.productId);
    product.name = checkedProduct.name;
    product.unitPrice = checkedProduct.finalPrice;
    product.finalPrice =
      product.quantity * checkedProduct.finalPrice.toFixed(2);
    finalProductList.push(product);
    subtotal += product.finalPrice;
  }
  const order = await orderModel.create({
    userId,
    // address,
    // phone,
    // note,
    products: finalProductList,
    // couponId: req.body.coupon?._id,
    subtotal,
    finalPrice:
      subtotal - (subtotal * ((req.body.coupon?.amount || 0) / 100)).toFixed(2),
    // paymentType,
    // status: paymentType == "card" ? "waitPayment" : 'placed'
    isDummy: true,
  });

  ticket.status = "accepted";
  await ticket.save();

  // send notification to client

  return res.status(201).json({ message: lang == "EN" ? "Done" : "تم", order });
});
