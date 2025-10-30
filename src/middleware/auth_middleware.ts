import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../base/http_error";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        // versi langsung
        return res.status(401).json({ message: 'Unauthorized' });
        // versi terstruktur (kalau pakai handler global):
        // return next(new UnauthorizedError('No token provided'));
    }

    try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  console.log("decoded JWT:", decoded);

  // Tambahkan logika fleksibel untuk semua kemungkinan payload
  const userId =
    decoded.sub || decoded.id || decoded.user_id; // ✅ ambil dari yang tersedia

  (req as any).user = {
    id: userId,
    ...decoded,
  };

  console.log("req.user:", (req as any).user);
  next();
} catch (error) {
  return res.status(401).json({ message: "Invalid token" });
}
};