import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error.flatten().fieldErrors);
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
