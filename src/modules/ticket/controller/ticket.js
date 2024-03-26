import { orderStatus } from "../../../../DB/model/Order.model.js";
import medicineModel from "../../../../DB/model/medicine.model.js";
import ticketModel from "../../../../DB/model/ticket.model.js";
import { isExpired } from "../ticket.service.js";
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

export const ticketToDummyOrder = asyncHandler(async (req, res, next) => {
  const lang = req.headers.lang || "EN";

  const { products } = req.body;
  const { ticketId } = req.params;

  const ticket = await ticketModel.findById(ticketId);

  if (!ticket)
    return next(
      new Error(
        lang == "EN"
          ? ` ticket  with id ${ticket._id} not found!`
          : "لا يوجد طلب بهذا الرقم!",
        { cause: { code: 404, customCode: 1015 } }
      )
    );

  const ticketOpenDate = new Date(ticket.createdAt);
  if (isExpired(ticketOpenDate)) {
    ticket.status = "closed";
    return next(
      new Error(
        lang == "EN"
          ? ` ticket  with id ${ticket._id} exceeded the allowed time!!`
          : " هذا الطلب تخطى الوقت المسوح به للقبول",
        { cause: { code: 400, customCode: 1017 } }
      )
    );
  }
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
    product.unitPrice = checkedProduct.salePrice;
    product.finalPrice = product.quantity * checkedProduct.salePrice.toFixed(2);
    finalProductList.push(product);
    subtotal += product.finalPrice;
  }
  const order = await orderModel.create({
    userId,
    products: finalProductList,
    subtotal,
    status: orderStatus.dummy,
  });

  // send notification to client

  return res.status(201).json({ message: lang == "EN" ? "Done" : "تم", order });
});
