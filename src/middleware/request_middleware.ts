import { NextFunction, Request, RequestHandler, Response } from "express";
import { IObject } from "../base/common";
import { UnprocessableEntityError } from "../base/http_error";
import Joi from 'joi';

const defaultOptions: IObject = {
    stripUnknown: {
        arrays: false,
        objects: true
    },
    abortEarly: false
};


export const SchemeValidator = (input: IObject, scheme: Joi.ObjectSchema, options = defaultOptions): any => {
    return scheme.validateAsync(input, options)
        .catch((err: any): void => {
            const details = err.details.reduce((detail: any, item: any): IObject => {
                detail[item.context.key] = item.message.replace(/"/g, '');
                return detail;
            }, {});
            throw new UnprocessableEntityError('error validating fields', 'VALIDATION_ERROR', details);
        });
};

export const requestValidator = (schema: any) => (req: Request, res: Response, next: NextFunction): RequestHandler => {
    const { query, params, body, headers } = req;
    const files = (req as any).files;

    return SchemeValidator({ query, params, body, files, headers }, schema)
        .then((validated: any): void => {
            req.query = validated.query;
            req.params = validated.params;
            req.body = validated.body;
            return next();
        })
        .catch((err: Error): void => next(err));
}