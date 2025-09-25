import { NextFunction, Request, Response } from "express";
import { HttpError } from "./http_error";
import { ErrorResponse } from "./common";

export const GlobalExceptionHandler = (error: any, req: Request, res: Response, _next: NextFunction): Response => {
    const httpError = HttpError.createFromError(error);

    const response: ErrorResponse = httpError.toErrorResponse();

    return res.status(httpError.httpStatus)
        .json(response);
};

export default GlobalExceptionHandler;