import { Service } from "../base/service";
import { Files } from "../entity/constant/file";
import { generateUuid } from "../lib/helpers";
import { BadRequestError, NotFoundError } from "../base/http_error";
import { PDFDocument } from "pdf-lib";
import { FileService } from "./file_service";
import DocumentRepository from "../repository/document_repository";
import { DOCUMENT_STATUS } from "../entity/constant/document";
import { Document } from "../entity/model/document";


export class DocumentService extends Service {
    private fileService: FileService;
    private documentRepository: DocumentRepository;
    public constructor(fileService: FileService, documentRepository: DocumentRepository) {
        super();
        this.fileService = fileService;
        this.documentRepository = documentRepository;
    }

    // async signPdf() {
        // const docs = await this.getFile('11f03321-964b-45dd-866b-eb0e47045093');
        // const sign = await this.getFile('43b58063-0f90-4e4b-bb81-d9e37cff7df4')
        // const pdfDocs = await PDFDocument.load(docs.Body);

        // const signImage = await pdfDocs.embedPng(sign.Body);
        // const pages = pdfDocs.getPages();
        // const firstPage = pages[0];
        // firstPage.drawImage(signImage, {
        //     x: 100,
        //     y: 100,
        //     width: 100,
        //     height: 100,
        // });

        // const pdfBytes = await pdfDocs.save();
        // const pdfBuffer = Buffer.from(pdfBytes);
        // const pdfFilename = `${generateUuid()}.pdf`;
        // return {
        //     buffer: pdfBuffer,
        //     mime_type: 'application/pdf',
        //     file_size: 10,
        //     file_name: pdfFilename,
        // }
    // }

    async uploadDocument(file: Files, userId: string): Promise<Document> {
        const options = {
            bucket_name: String(process.env.DOCUMENT_BUCKET),
            folder: userId,
        }
        const [result] = await this.fileService.upload([file], options);
        const doc = await this.documentRepository.create({
            id: generateUuid(),
            original_file_id: result.id as string,
            status: DOCUMENT_STATUS.DRAFT,
            user_id: userId
        })

        return doc
    }

    async previewOriginalDocument(id: string, userId: string): Promise<any> {
        const document = await this.documentRepository.findOneOrFail({ id }, { attributes: ['id', 'original_file_id', 'user_id'] });
        if (document.user_id !== userId) {
            throw new BadRequestError('you`re not owner this document', 'NOT_DOCUMENT_OWNER')
        }

        return this.fileService.downloadPreview(document.original_file_id);
    }
}