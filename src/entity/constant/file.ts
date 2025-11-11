import { Readable } from "stream";

export interface Files{
    buffer: Buffer;
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    filename?: string;
    encoding?: string;
    stream?: Readable;
    destination?: string;
    path?: string;
}

export const S3_DEFAULT = {
    API_VERSION: '2006-03-01',
    BUCKET_NAME: 'zign-bucket',
}

export interface S3RequestPayload {
    bucket: string;
    key: string;
    delimiter?: string;
    is_public?: boolean;
}

export interface S3ListObjectRequestPayload {
    bucket: string;
    prefix?: string;
    marker?: string;
    max_keys?: number;
}

export interface S3UploadOptions {
    bucket_name: string;
    folder: string;
    filename?: string;
}

export interface GetObjectResponse {
    Body?: any;
    ContentType: string;
    ContentLength: number;
    LastModified?: Date;
    ETag: string;
}

export enum FILE_MIMETYPE {
    PDF = 'application/pdf',
    PNG = 'image/png'
}