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
        res.set({}).end(document.buffer, 'binary');
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
    }
}

