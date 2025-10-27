import FileRepository from "../repository/file_repository";
import { Service } from "../base/service";
import S3Provider from "../lib/s3-provider";
import { Files, GetObjectResponse, S3UploadOptions } from "../entity/constant/file";
import { generateChecksum, generateUuid } from "../lib/helpers";
import { join } from "path";
import { Readable } from "stream";
import { File } from "@prisma/client";
import { NotFoundError } from "../base/http_error";
import { PDFDocument } from "pdf-lib";


export class FileService extends Service {
    private fileRepository: FileRepository;
    private s3Provider: S3Provider;
    public constructor(fileRepository: FileRepository, s3Provider: S3Provider) {
        super();
        this.fileRepository = fileRepository;
        this.s3Provider = s3Provider;
    }

    public async upload(files: Files[], options: S3UploadOptions): Promise<any> {
        console.log('called')
        await this.getBucket(options.bucket_name);
        const processUploads = files.map(file => {
            const fileKey = generateUuid();
            const extension = file.mimetype.split('/')[1];

            const prefix = options.folder;
            const key = `${join(prefix, fileKey)}.${extension}`;

            return this.s3Provider.upload({
                Bucket: options.bucket_name,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read',
            }).then((res) => {
                console.log(res)
                return {
                    id: fileKey,
                    key,
                    bucket_name: options.bucket_name,
                    file_url: res.Location,
                    file_name: file.originalname,
                    file_size: file.size,
                    mime_type: file.mimetype,
                    checksum: generateChecksum(file.buffer)
                }
            })
            .catch((err) => {
                throw err;
            })
        })

        
        const resultUploads = await Promise.all(processUploads);
        console.log(resultUploads)
        await this.fileRepository.createMany(resultUploads);
        return resultUploads;
    }

    public async getBucket(bucketName: string): Promise<any> {
        try {
            return await this.s3Provider.getBucket(bucketName);
        } catch (error: any) {
            console.log(error)
            throw error;
        }
    }

    public async downloadPreview(payload: Partial<File>, userId?: number): Promise<any> {
        const file = await this.fileRepository.findOne(payload);
        if (!file) {
            throw new NotFoundError('File with the specified id not found', 'FILE_NOT_FOUND');
        }

        if(!file.bucket_name) {
            throw new NotFoundError('File does not have an associated bucket', 'FILE_NO_BUCKET');
        }

        const data = await this.s3Provider.get({
            bucket: file.bucket_name,
            key: file.key
        });

        console.log(data)

        return {
            ...file,
            buffer: data.Body
        };
    }

    async signPdf() {
        try {
            const docs = await this.getFile('11f03321-964b-45dd-866b-eb0e47045093');
            const sign = await this.getFile('43b58063-0f90-4e4b-bb81-d9e37cff7df4')
            const pdfDocs = await PDFDocument.load(docs.Body);
    
            const signImage = await pdfDocs.embedPng(sign.Body);
            const pages = pdfDocs.getPages();
            const firstPage = pages[0];
            firstPage.drawImage(signImage, {
                x: 100,
                y: 100,
                width: 100,
                height: 100,
            });
    
            const pdfBytes = await pdfDocs.save();
            const pdfBuffer = Buffer.from(pdfBytes);
            const pdfFilename = `${generateUuid()}`;

            return {
                buffer: pdfBuffer,
                mime_type: 'application/pdf',
                file_size: 7478,
                file_name: pdfFilename,
            }
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async getFile(id: string) {
        const file = await this.fileRepository.findOne({ id });
        if (!file) {
            throw new NotFoundError('File with the specified id not found', 'FILE_NOT_FOUND');
        }

        if(!file.bucket_name) {
            throw new NotFoundError('File does not have an associated bucket', 'FILE_NO_BUCKET');
        }

        const data = await this.s3Provider.get({
            bucket: file.bucket_name,
            key: file.key
        });

        return data
    }
}