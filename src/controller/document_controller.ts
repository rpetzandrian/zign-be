import { Request, Response } from "express";
import Controller from "../base/controller";
import { DocumentService } from "../service/document_service";
import UploadMiddleware from "../middleware/upload_middleware";
import { authMiddleware } from "../middleware/auth_middleware";
import { requestValidator } from "../middleware/request_middleware";
import { PREVIEW_DOCUMENT, SIGN_DOCUMENT, UPLOAD_DOCUMENT } from "../entity/validation/document";
import { SignDocsDto } from "src/entity/dto/document";


export class DocumentController extends Controller {
    private documentService: DocumentService;
    constructor(documentService: DocumentService) {
        super('document')
        this.documentService = documentService
    }

    public async uploadDocs(req: Request, res: Response) {
        const files = req.files as Express.Multer.File[]
        const context = (req as any).context as { user_id: string }
        const document = await this.documentService.uploadDocument(files[0], context.user_id);
        return res.send({
            success: true,
            message: 'Success upload document',
            data: document
        })
    }

    public async previewDocument(req: Request, res: Response) {
        const { params, query } = req;
        const context = (req as any).context as { user_id: string }
        const document = await this.documentService.previewDocument(params.id, query.type as string, context.user_id);
        res.send({
            buffer: document.buffer,
            parameters: {
                mimeType: document.mime_type,
                fileName: document.file_name,
                size: document.file_size,
            }
        })
    }

    public async signDocument(req: Request, res: Response) {
        const body: SignDocsDto = req.body;
        const context = (req as any).context as { user_id: string }
        const document = await this.documentService.signDocument(body, context.user_id);
        return res.send({
            success: true,
            message: 'Success sign document!',
            data: document
        })
    }

    public async downloadDocument(req: Request, res: Response) {
        const { params, query } = req;
        const context = (req as any).context as { user_id: string }
        const document = await this.documentService.previewDocument(params.id, query.type as string, context.user_id);
        res.set({
            'Content-Type': document.mime_type,
            'Content-Disposition': `attachment;filename="${document.file_name}"`,
            'Content-Length': document.file_size.toString(),
        }).end(document.buffer, 'binary');
    }

    public async getDocumentList(req: Request, res: Response) {
        const context = (req as any).context as { user_id: string }
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const page = req.query.page ? Number(req.query.page) : undefined;
        const documents = await this.documentService.getDocumentList(context.user_id , page, limit);
        return res.send({
            success: true,
            message: 'Success get document list',
            data: documents
        })
    }

    protected setRoutes(): void {
        this._routes.post(`/v1/${this.path}/upload`, authMiddleware, UploadMiddleware(), requestValidator(UPLOAD_DOCUMENT), (req, res) => {
            return this.uploadDocs(req, res)
        })
        this._routes.post(`/v1/${this.path}/sign`, authMiddleware, UploadMiddleware(), requestValidator(SIGN_DOCUMENT), (req, res) => {
            return this.signDocument(req, res)
        })
        this._routes.get(`/v1/${this.path}/preview/:id`, authMiddleware, requestValidator(PREVIEW_DOCUMENT), (req, res) => {
            return this.previewDocument(req, res)
        })
        this._routes.get(`/v1/${this.path}/download/:id`, authMiddleware, requestValidator(PREVIEW_DOCUMENT), (req, res) => {
            return this.downloadDocument(req, res)
        })
        this._routes.get(`/v1/${this.path}/list`, authMiddleware, (req, res) => {
            return this.getDocumentList(req, res)
        })
    }
}

