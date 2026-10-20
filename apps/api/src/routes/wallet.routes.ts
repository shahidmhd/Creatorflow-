import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { walletService } from "../services/wallet.service";
import { success } from "../utils/response";
import { AuthRequest } from "../types";

export const walletRoutes = Router();

/** GET /api/v1/wallet */
walletRoutes.get("/", authenticate, async (req, res, next) => {
  try {
    const wallet = await walletService.getByUserId((req as AuthRequest).user.id);
    success(res, wallet);
  } catch (err) { next(err); }
});

/** POST /api/v1/wallet/add-funds */
walletRoutes.post("/add-funds", authenticate, async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ success: false, error: "Please enter a valid positive deposit amount" });
      return;
    }
    const result = await walletService.addFunds(
      (req as AuthRequest).user.id,
      Math.round(numAmount),
      description || "Funds added to wallet"
    );
    success(res, result);
  } catch (err) { next(err); }
});

/** GET /api/v1/wallet/transactions */
walletRoutes.get("/transactions", authenticate, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await walletService.getTransactions((req as AuthRequest).user.id, page, limit);
    success(res, result);
  } catch (err) { next(err); }
});
