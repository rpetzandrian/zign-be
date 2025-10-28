import { Request, Response } from "express";
import Controller from "../base/controller";
import { DocumentService } from "../service/document_service";
import UploadMiddleware from "../middleware/upload_middleware";
import { authMiddleware } from "../middleware/auth_middleware";


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

    public async previewOriginalDocument(req: Request, res: Response) {
        const params = req.params;
        const context = (req as any).context as { user_id: string }
        const document = await this.documentService.previewOriginalDocument(params.id, context.user_id);
        res.set({}).end(document.buffer, 'binary');
    }

    protected setRoutes(): void {
        this._routes.post(`/v1/${this.path}/upload`, authMiddleware, UploadMiddleware(), (req, res) => {
            return this.uploadDocs(req, res)
        })
        this._routes.get(`/v1/${this.path}/preview-original/:id`, authMiddleware, (req, res) => {
            return this.previewOriginalDocument(req, res)
        })
    }
}

