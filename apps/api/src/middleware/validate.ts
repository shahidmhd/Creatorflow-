import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type Target = "body" | "params" | "query";

export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const fields: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join(".") || "root";
        if (!fields[key]) fields[key] = [];
        fields[key].push(e.message);
      });
      res.status(422).json({
        success: false,
        error: "Validation failed",
        fields,
      });
      return;
    }
    req[target] = result.data;
    next();
  };
}
