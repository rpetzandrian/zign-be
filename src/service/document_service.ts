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
import { buffer } from "stream/consumers";


export class DocumentService extends Service {
    private fileRepository: FileRepository;
    private s3Provider: S3Provider;
    public constructor(fileRepository: FileRepository, s3Provider: S3Provider) {
        super();
        this.fileRepository = fileRepository;
        this.s3Provider = s3Provider;
    }

    async signPdf() {
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
        const pdfFilename = `${generateUuid()}.pdf`;
        return {
            buffer: pdfBuffer,
            mime_type: 'application/pdf',
            file_size: 10,
            file_name: pdfFilename,
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