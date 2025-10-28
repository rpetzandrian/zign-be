import { Service } from "../base/service";
import { FILE_MIMETYPE, Files } from "../entity/constant/file";
import { generateUuid } from "../lib/helpers";
import { BadRequestError, NotFoundError } from "../base/http_error";
import { PDFDocument } from "pdf-lib";
import { FileService } from "./file_service";
import DocumentRepository from "../repository/document_repository";
import { DOCUMENT_STATUS } from "../entity/constant/document";
import { Document } from "../entity/model/document";
import { SignDocsDto } from "../entity/dto/document";
import SignRepository from "../repository/sign_repository";


export class DocumentService extends Service {
    private fileService: FileService;
    private documentRepository: DocumentRepository;
    private signRepository: SignRepository
    public constructor(fileService: FileService, documentRepository: DocumentRepository, signRepository: SignRepository) {
        super();
        this.fileService = fileService;
        this.documentRepository = documentRepository;
        this.signRepository = signRepository;
    }

    async signDocument(payload: SignDocsDto, userId: string) {
        try {
            const [docs, sign] = await Promise.all([
                this.documentRepository.findOneOrFail({ id: payload.document_id }),
                this.signRepository.findOneOrFail({ id: payload.sign_id })
            ])

            const docsBinary = await this.fileService.getFile(docs.original_file_id);
            const signBinary = await this.fileService.getFile(sign.file_id)
            const pdfDocs = await PDFDocument.load(docsBinary.Body);
    
            const signImage = await pdfDocs.embedPng(signBinary.Body);
            const pages = pdfDocs.getPages();
            const firstPage = pages[0];
            firstPage.drawImage(signImage, {
                x: payload.metadata.koor_x,
                y: payload.metadata.koor_y,
                width: payload.metadata.width,
                height: payload.metadata.height,
            });
    
            const pdfBytes = await pdfDocs.save();
            const pdfBuffer = Buffer.from(pdfBytes);
            const pdfFilename = `${generateUuid()}.pdf`;

            const [savedSignedDocs] = await this.fileService.upload([{
                buffer: pdfBuffer,
                mimetype: FILE_MIMETYPE.PDF,
                fieldname: 'files',
                originalname: pdfFilename,
                size: pdfBuffer.byteLength,
                filename: pdfFilename
            }], { bucket_name: String(process.env.DOCUMENT_BUCKET), folder: userId })

            await this.documentRepository.update({ id: docs.id }, { 
                signed_file_id: savedSignedDocs.id as string, 
                sign_id: sign.id as string, 
                status: DOCUMENT_STATUS.SIGNED,
                metadata: JSON.stringify({ sign_at: new Date() }),
            })

            const updatedDocs = await this.documentRepository.findOneOrFail({ id: payload.document_id });
            return updatedDocs;
        } catch (error) {
            console.log(error);
            throw error
        }
    }

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

    async previewDocument(id: string, type: string, userId: string): Promise<any> {
        const document = await this.documentRepository.findOneOrFail({ id }, { attributes: ['id', 'original_file_id', 'signed_file_id', 'user_id'] });
        if (document.user_id !== userId) {
            throw new BadRequestError('you`re not owner this document', 'NOT_DOCUMENT_OWNER')
        }

        const fileId = type === 'signed' ? document.signed_file_id : document.original_file_id;
        if (!fileId) throw new BadRequestError('file not exist', 'FILE_NOT_EXIST')
        return this.fileService.downloadPreview(fileId);
    }
}