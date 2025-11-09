import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../base/http_error";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new UnauthorizedError("No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).context = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid token"));
  }
};
