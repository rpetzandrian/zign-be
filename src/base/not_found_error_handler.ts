import { NextFunction, Request, Response } from "express";
import { COMMON_ERRORS } from "./common";
import { NotFoundError } from "./http_error";

export const NotFoundExceptionHandler = (_req: Request, _res: Response, next: NextFunction): void => {
    const err: any = new NotFoundError('route not found', COMMON_ERRORS.ROUTE_NOT_FOUND);
    return next(err);
}

export default NotFoundExceptionHandler;