import { RequestHandler } from "express";
import multer from 'multer';

interface UploadMiddlewareOptions {
    fieldName: string;
    fieldSizeLimit?: number;
}

export const defaultOpts: UploadMiddlewareOptions = {
    fieldName: 'files'
};



export const UploadMiddleware = (opts = defaultOpts): RequestHandler => {
    return multer({ limits: { fieldNameSize: opts.fieldSizeLimit } }).array(opts.fieldName) as any;
};

export default UploadMiddleware;``