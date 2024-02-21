import User from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import Pharmacy from "./../../../../DB/model/Pharmacy.model.js";

export const profile = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";
  const user = await User.findById(req.user._id).select(
    "email fullName image phone address gender status -_id height weight blood chronicDiseases"
  );
  return res.json({ message: lang == "EN" ? "Done" : "تم", user });
});

export const profilePic = asyncHandler(async (req, res, next) => {
  const lang = req.headers?.lang || "EN";

  const user = await User.findById(req.user._id).select(
    "email fullName image phone address gender status -_id height weight blood chronicDiseases"
  );

  if (user.image.length > 0)
    await unlink(path.join(__dirname, `./../../../${user.image}`));

  user.image = req.file.dest;
  await user.save();

  return res.json({ message: lang == "EN" ? "Done" : "تم", user });
});

export const sendNotification = asyncHandler(async (req, res, next) => {
  // user
  const { lat, long } = req.body;

  // pharmacies
  let buffer = 100 * 1000;
  const results = await Pharmacy.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lat, long], buffer / 6371000],
      },
    },
  });

  // send notification to those pharmacies // TODO >>>>
});
