import { verifyToken } from "../utils/GenerateAndVerifyToken.js";
import userModel from "../../DB/model/User.model.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { getIo } from "../utils/server.js";

export const roles = {
  Admin: "Admin",
  User: "User",
  HR: "HR",
};
export const auth = (accessRole = "") => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("In-valid Bearer Key", { cause: 400 }));
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return next(new Error("In-valid token", { cause: 400 }));
    }
    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      return next(new Error("In-valid token payload", { cause: 400 }));
    }
    const user = await userModel
      .findById(decoded.id)
      .select("userName email image role changePasswordTime socketId")
      .populate([
        {
          path: "role",
          populate: {
            path: "privileges",
            select: "-_id title",
          },
        },
      ]);

    if (!user) {
      return next(new Error("Not register user", { cause: 401 }));
    }
    if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
      return next(new Error("Expired token", { cause: 400 }));
    }

    // if (!user.role?.privileges) {
    //     return next(new Error("no access roles", { cause: 400 }))
    // }

    // let userPrivies = user.role?.privileges?.map(ele => ele.title)
    // console.log({userPrivies});
    // if (!userPrivies.includes(accessRole.toLowerCase())) {
    //     return next(new Error("Not authorized user", { cause: 403 }))
    // }

    req.user = user;
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
