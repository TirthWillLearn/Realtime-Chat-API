import express from "express";
import { uploads } from "../config/multer";

const router = express.Router();

router.post("/uploads", uploads.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // use dynamic base URL (important for deployment)
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.json({
      url: `${baseUrl}/uploads/${req.file.filename}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "File upload failed" });
  }
});

export default router;
