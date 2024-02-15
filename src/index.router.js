import morgan from "morgan";
import connectDB from "../DB/connection.js";
import authRouter from "./modules/auth/auth.router.js";
import branRouter from "./modules/brand/brand.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import categoryRouter from "./modules/category/category.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import orderRouter from "./modules/order/order.router.js";
import reviewsRouter from "./modules/reviews/reviews.router.js";
import userRouter from "./modules/user/user.router.js";
import privilegeRouter from "./modules/privilege/privilege.router.js";
import chronicDiseaseRouter from "./modules/chronicDisease/chronicDisease.router.js";
import medicineRouter from "./modules/medicine/medicine.router.js";
import wishlistRouter from './modules/wishlist/wishlist.router.js'
import roleRouter from "./modules/role/role.router.js";
import chatRouter from "./modules/chat/chat.router.js";
import adminRouter from "./modules/admin/admin.router.js";
import pharmacyRouter from './modules/pharmacy/pharmacy.router.js'
import { globalErrorHandling } from "./utils/errorHandling.js";
import cors from "cors";

const bootstrap = (app, express) => {
  app.use(cors()); // allow access from anywhere

  if (process.env.MOOD == "DEV") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  //convert Buffer Data

  app.use((req, res, next) => {
    console.log({ url: req.originalUrl });
    if (req.originalUrl == "/order/webhook") {
      next();
    } else {
      express.json({})(req, res, next);
    }
  });

  //Setup API Routing

  app.get("/", (req, res, next) => {
    return res.status(200).json({ message: "Welcome To Pharmacy App" });
  });
  app.use(`/auth`, authRouter);
  app.use(`/user`, userRouter);
  app.use(`/admin`, adminRouter);
  app.use(`/medicine`, medicineRouter);
  app.use(`/pharmacy`, pharmacyRouter);
  app.use(`/privilege`, privilegeRouter);
  app.use(`/chronicDisease`, chronicDiseaseRouter);
  app.use(`/role`, roleRouter);
  app.use(`/category`, categoryRouter);
  app.use(`/reviews`, reviewsRouter);
  app.use(`/coupon`, couponRouter);
  app.use(`/cart`, cartRouter);
  app.use(`/order`, orderRouter);
  app.use(`/brand`, branRouter);
  app.use(`/chat`, chatRouter);
  app.use(`/wishlist`, wishlistRouter);

  app.all("*", (req, res, next) => {
    res.status(404).send("In-valid Routing Plz check url or method");
  });

  app.use(globalErrorHandling);
  connectDB();
};

export default bootstrap;
