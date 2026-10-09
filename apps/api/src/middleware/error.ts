import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma unique constraint violation
  if (
    err instanceof Error &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  ) {
    const meta = (err as { meta?: { target?: string[] } }).meta;
    const targets = Array.isArray(meta?.target) ? meta.target.join("_") : "";
    let code = "RESOURCE_ALREADY_EXISTS";
    let message = "Resource already exists";

    if (targets.includes("campaignId") && targets.includes("editorId")) {
      code = "APPLICATION_ALREADY_EXISTS";
      message = "You have already applied to this campaign.";
    }

    res.status(409).json({ success: false, error: message, code });
    return;
  }

  console.error("Unexpected error:", err);
  const details = err instanceof Error ? err.message : String(err);
  res.status(500).json({ success: false, error: "Internal server error", details });
}
