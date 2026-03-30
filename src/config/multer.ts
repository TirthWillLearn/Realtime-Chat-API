import multer from "multer";
import path from "path";

// configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // store files in /uploads folder (served statically later)
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    // generate unique filename to avoid collisions
    const uniqueName = `chat-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// allow only image uploads
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"));
  }
};

// multer middleware with storage + validation + size limit
export const uploads = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
});
