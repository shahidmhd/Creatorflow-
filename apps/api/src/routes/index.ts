import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { campaignRoutes } from "./campaign.routes";
import { applicationRoutes } from "./application.routes";
import { submissionRoutes } from "./submission.routes";
import { publishedPostRoutes } from "./published-post.routes";
import { rewardRoutes } from "./reward.routes";
import { walletRoutes } from "./wallet.routes";
import { notificationRoutes } from "./notification.routes";
import { adminRoutes } from "./admin.routes";
import { uploadRoutes } from "./upload.routes";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/applications", applicationRoutes);
router.use("/submissions", submissionRoutes);
router.use("/published-posts", publishedPostRoutes);
router.use("/rewards", rewardRoutes);
router.use("/wallet", walletRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
