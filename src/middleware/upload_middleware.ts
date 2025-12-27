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
    return multer({ limits: { fieldNameSize: opts.fieldSizeLimit, fileSize: 50 * 1024 * 1024 } }).array(opts.fieldName) as any;
};

export default UploadMiddleware;