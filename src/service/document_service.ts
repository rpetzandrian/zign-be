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
import { Poppler } from "node-poppler";


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

            if (payload.metadata.page > pages.length) {
                throw new BadRequestError('Page number is out of range')
            }

            const targetPage = pages[payload.metadata.page - 1];
            targetPage.drawImage(signImage, {
                x: payload.metadata.koor_x,
                y: payload.metadata.koor_y,
                width: payload.metadata.width,
                height: payload.metadata.height,
            });

            const metadata = { 
                sign_at: new Date(),
                creator: 'Zign App',
                author: userId
            }

            pdfDocs.setModificationDate(metadata.sign_at);
            pdfDocs.setAuthor(userId);
            pdfDocs.setCreator('Zign App');
            
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
                metadata: JSON.stringify(metadata),
            })

            const updatedDocs = await this.documentRepository.findOneOrFail({ id: payload.document_id });
            return updatedDocs;
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    async uploadDocument(file: Files, userId: string): Promise<Document> {
        const options = {
            bucket_name: String(process.env.DOCUMENT_BUCKET),
            folder: userId,
        }
        const [result] = await this.fileService.upload([file], options);

        const coverImage = await this.getCoverAsImage(file.buffer);
        const coverFilename = `cover-test-${generateUuid()}`;
        const coverBuffer = Buffer.from(coverImage);
        const [savedCover] = await this.fileService.uploadPublic([{
            buffer: coverBuffer,
            mimetype: FILE_MIMETYPE.PNG,
            fieldname: 'files',
            originalname: coverFilename,
            size: coverBuffer.byteLength,
            filename: coverFilename,
        }], { bucket_name: String(process.env.IMAGE_BUCKET), folder: `docs-cover/${userId}` });

        const doc = await this.documentRepository.create({
            id: generateUuid(),
            original_file_id: result.id as string,
            status: DOCUMENT_STATUS.DRAFT,
            user_id: userId,
            cover_url: savedCover.file_url as string,
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

    async getCoverAsImage(buffer: Buffer) {
        try {
            const poppler = new Poppler();
            const coverImage = await poppler.pdfToCairo(buffer, undefined, {
                lastPageToConvert: 1,
                pngFile: true,
                singleFile: true,
            });

            return Buffer.from(coverImage, 'binary');
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    public async getDocumentList(userId: string, page: number = 1, limit: number = 10) {

        // Total record tanpa paging
        const count_total_size = await this.documentRepository.count({
            user_id: userId
        });

        // Ambil data sesuai page
        const documents = await this.documentRepository.findAll(
            { user_id: userId },
            {
                attributes: ['id', 'original_file_id', 'signed_file_id', 'user_id', 'cover_url', 'status'],
                page,
                limit
            }
        );

        const count_total = documents.length;
        const count_total_page = Math.ceil(count_total_size / limit);

        return {
            count_total_size,
            count_total_page,
            count_total,
            previous_page: page > 1 ? page - 1 : null,
            next_page: page < count_total_page ? page + 1 : null,
            rows_data: {
                docs: documents
            }
        };
    }

}