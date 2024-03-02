import multer from "multer";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const folderNames = {
  medicine: "medicine",
  brand: "brand",
  category: "category",
  pharmacy: "pharmacy",
  coupon: "coupon",
  user: "user",
};
export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif" , 'image/jpg'],
  file: ["application/pdf", "application/msword"],
  video: ["video/mp4"],
};
export function diskFileUpload(customPath = "general", customValidation = []) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let fullPath = path.join(__dirname, `../uploads/${customPath}`);

      if (!req.query?.imageFolderName) {
        if (customPath == folderNames.user) {
          const userId = req.user.id;
          fullPath = `${fullPath}/${userId}`;
          file.uniqueFolder = userId;
        } else {
          req.imageFolderName = nanoid();
          file.uniqueFolder = req.imageFolderName;
          fullPath = `${fullPath}/${req.imageFolderName}`;
        }
      } else {
        req.imageFolderName = req.query.imageFolderName;
        file.uniqueFolder = req.imageFolderName;
        fullPath = `${fullPath}/${req.imageFolderName}`;
      }

      // if (customPath != "medicine") {
      //   const medicineFolder = nanoid();
      //   req.medicineFolder = medicineFolder;
      //   file.uniqueFolder = medicineFolder;
      //   fullPath = `${fullPath}/${medicineFolder}`;
      // }

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      return cb(null, fullPath);
    },

    filename: (req, file, cb) => {
      const uniqueFileName = nanoid() + "_" + file.originalname;
      file.dest = `uploads/${customPath}/${file.uniqueFolder}/${uniqueFileName}`;
      cb(null, uniqueFileName);
    },
  });

  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log({DSFile:file});
      // /     mimetype: 'image/jpg'
      cb("In-valid file format", false);
    }
  }

  const upload = multer({ fileFilter, storage });
  return upload;
}

export function fileUpload(customValidation = []) {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb("In-valid file format", false);
    }
  }
  const upload = multer({ fileFilter, storage });
  return upload;
}
