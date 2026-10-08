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
