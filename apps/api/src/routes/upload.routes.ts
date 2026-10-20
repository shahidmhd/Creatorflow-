import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";
import { success } from "../utils/response";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadRoutes = Router();

/** POST /api/v1/upload — directly upload base64 image or data URI to Cloudinary */
uploadRoutes.post("/", authenticate, async (req, res, next) => {
  try {
    const { file, folder = "creatorflow" } = req.body;
    if (!file || typeof file !== "string") {
      res.status(400).json({ success: false, error: "Please provide a valid image file" });
      return;
    }

    // Ensure Cloudinary uses active credentials
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || config.cloudinary.cloudName,
      api_key: process.env.CLOUDINARY_API_KEY || config.cloudinary.apiKey,
      api_secret: process.env.CLOUDINARY_API_SECRET || config.cloudinary.apiSecret,
    });

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "image",
    });

    success(res, {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    });
  } catch (err: unknown) {
    console.error("Cloudinary upload error:", err);
    const msg =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Failed to upload image to Cloudinary";
    res.status(400).json({ success: false, error: msg });
  }
});

/** POST /api/v1/upload/sign — returns a signed Cloudinary upload URL */
uploadRoutes.post("/sign", authenticate, async (_req, res, next) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "creatorflow" },
      config.cloudinary.apiSecret
    );
    success(res, {
      signature,
      timestamp,
      apiKey: config.cloudinary.apiKey,
      cloudName: config.cloudinary.cloudName,
      folder: "creatorflow",
    });
  } catch (err) { next(err); }
});
