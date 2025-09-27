import { NextFunction, Request, Response } from "express";
import { verifyJwtToken } from "../lib/jwt";
import { UnauthorizedError } from "../base/http_error";


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return next(new UnauthorizedError('No token provided'));
    }

    try {
        const decoded = verifyJwtToken(token);
        (req as any).context = decoded;
        next();
    } catch (error) {
        return next(new UnauthorizedError('Invalid token'));
    }
}