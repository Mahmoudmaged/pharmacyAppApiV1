import User from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const profile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "email fullName image phone address gender status -_id height weight blood chronicDiseases"
  );
  return res.json({ message: "Done", user });
});

export const profilePic = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    image: req.file.dest,
  });

  if (user.image) {
    await unlink(path.join(__dirname, `./../../../${user.image}`));
  }

  return res.json({ message: "Done" });
});
