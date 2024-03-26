import { verifyToken } from "../utils/GenerateAndVerifyToken.js";
import userModel from "../../DB/model/User.model.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { getIo } from "../utils/server.js";
import pharmacyModel from "../../DB/model/Pharmacy.model.js";

export const roles = {
  Admin: "Admin",
  User: "User",
  HR: "HR",
};

// TODO >>>> read from the database
export const privileges = {
  writeBrand: "writeBrand",
  readBrand: "readBrand",

  writeCategory: "writeCategory",
  readCategory: "readCategory",

  writeRole: "writeRole",
  readRole: "readRole",

  writeAdmin: "writeAdmin",
  readAdmin: "readAdmin",

  readChronicDisease: "readChronicDisease",
  writeChronicDisease: "writeChronicDisease",

  readMedicine: "readMedicine",
  writeMedicine: "writeMedicine",

  readWishlist: "readWishlist",
  writeWishlist: "writeWishlist",

  readCoupon: "readCoupon",
  writeCoupon: "writeCoupon",

  rejectPharmacy: "rejectPharmacy",
  approvePharmacy: "approvePharmacy",

  // createOrder: "createOrder",
};

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(
        new Error(
          lang == "EN" ? "In-valid Bearer Key" : "خطاء بكلمه تعريف الارتباط",
          { cause: { code: 400, customCode: 1013 } }
        )
      );
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return next(
        new Error(lang == "EN" ? "In-valid token" : "خطاء في  شهاده التحقق", {
          cause: { code: 400, customCode: 1010 },
        })
      );
    }
    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      return next(
        new Error(
          lang == "EN"
            ? "In-valid token payload"
            : "خطاء في محتوي شهاده التحقق",
          { cause: { code: 400, customCode: 1010 } }
        )
      );
    }
    let user = "";
    if (req.originalUrl.startsWith("/pharmacy")) {
      user = await pharmacyModel
        .findById(decoded.id)
        .select("userName email image changePasswordTime socketId password");
    } else {
      user = await userModel
        .findById(decoded.id)
        .select(
          "userName email image role changePasswordTime socketId password"
        )
        .populate([
          {
            path: "role",
            populate: {
              path: "privileges",
              select: "-_id title",
            },
          },
        ]);
    }

    if (!user) {
      return next(
        new Error(
          lang == "EN"
            ? "Not register user"
            : "لم يتم العثور علي حساب المستخدم",
          { cause: { code: 404, customCode: 1004 } }
        )
      );
    }
    if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
      return next(
        new Error(
          lang == "EN"
            ? "Expired token"
            : "عفوا لقد قمت باستخدام جمله ارتباط منتهيه الصلاحيه برجاء تسجيل الدخول مجددا",
          { cause: { code: 400, customCode: 1012 } }
        )
      );
    }
    req.user = user;

    return next();
  });
};

export const authorization = (accessRole = "") => {
  return asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const user = req.user;
    if (!user.role?.privileges) {
      return next(
        new Error(lang == "EN" ? "no access roles" : "عفو لا تمتلك الصلاحيه", {
          cause: { code: 403, customCode: 1003 },
        })
      );
    }

    let userPrivies = user.role?.privileges?.map((ele) => ele.title);
    console.log({ userPrivies, accessRole });
    if (!userPrivies.includes(accessRole.toLowerCase())) {
      return next(
        new Error(
          lang == "EN" ? "Not authorized user" : "عفو لا تمتلك الصلاحيه",
          { cause: { code: 403, customCode: 1003 } }
        )
      );
    }
    return next();
  });
};

export const graphAuth = async (authorization, accessRoles = []) => {
  try {
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      throw new Error("In-valid Bearer Key");
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      throw new Error("In-valid token");
    }
    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      throw new Error("In-valid token payload");
    }
    const user = await userModel
      .findById(decoded.id)
      .select("userName email image role changePasswordTime");
    if (!user) {
      throw new Error("Not register user");
    }
    if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
      throw new Error("Expired token");
    }

    if (!accessRoles.includes(user.role)) {
      throw new Error("Not authorized user");
    }
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

export const socketAuth = async (authorization, accessRoles = [], socketId) => {
  try {
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      getIo().to(socketId).emit("authSocket", "In-valid Bearer Key");
      return false;
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      getIo().to(socketId).emit("authSocket", "In-valid token");
      return false;
    }
    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      getIo().to(socketId).emit("authSocket", "In-valid token payload");
      return false;
    }
    const user = await userModel
      .findById(decoded.id)
      .select("userName email image role changePasswordTime");
    if (!user) {
      getIo().to(socketId).emit("authSocket", "Not register user");
      return false;
    }
    if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
      getIo().to(socketId).emit("authSocket", "Expired token");
      return false;
    }

    if (!accessRoles.includes(user.role)) {
      getIo().to(socketId).emit("authSocket", "Not authorized user");
      return false;
    }
    return user;
  } catch (error) {
    getIo().to(socketId).emit("authSocket", error);
    return false;
  }
};
