import FileRepository from "../repository/file_repository";
import { Service } from "../base/service";
import S3Provider from "../lib/s3-provider";
import { Files, S3UploadOptions } from "../entity/constant/file";
import { generateChecksum, generateUuid } from "../lib/helpers";
import { join } from "path";
import { NotFoundError } from "../base/http_error";
import { PDFDocument } from "pdf-lib";
import { File } from "../entity/model/file";


export class FileService extends Service {
    private fileRepository: FileRepository;
    private s3Provider: S3Provider;
    public constructor(fileRepository: FileRepository, s3Provider: S3Provider) {
        super();
        this.fileRepository = fileRepository;
        this.s3Provider = s3Provider;
    }

    public async uploadPublic(files: Files[], options: S3UploadOptions): Promise<Partial<File>[]> {
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
        await this.fileRepository.createMany(resultUploads);
        return resultUploads;
    }

    public async upload(files: Files[], options: S3UploadOptions): Promise<Partial<File>[]> {
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
                ContentType: file.mimetype
            }).then((res) => {
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
        await this.fileRepository.createMany(resultUploads);
        return resultUploads;
    }

    public async getBucket(bucketName: string): Promise<any> {
        try {
            return await this.s3Provider.getBucket(bucketName);
        } catch (error: any) {
            throw error;
        }
    }

    public async downloadPreview(id: string): Promise<any> {
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

        return {
            ...file,
            buffer: data.Body
        };
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