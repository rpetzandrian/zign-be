import { Request, Response } from "express";
import Controller from "../base/controller";
import UploadMiddleware from "../middleware/upload_middleware";
import { authMiddleware } from "../middleware/auth_middleware";
import { requestValidator } from "../middleware/request_middleware";
import {  UPLOAD_DOCUMENT } from "../entity/validation/document";
import { SignService } from "src/service/sign_service";


export class SignController extends Controller {
    private signService: SignService
    constructor(signService: SignService) {
        super('sign')
        this.signService = signService;
    }

    public async uploadSignSpecimen(req: Request, res: Response) {
        const files = req.files as Express.Multer.File[]
        const context = (req as any).context as { user_id: string }
        const document = await this.signService.uploadSignSpecimen(files[0], context.user_id);
        return res.send({
            success: true,
            message: 'Success upload speciment',
            data: document
        })
    }


    protected setRoutes(): void {
        this._routes.post(`/v1/${this.path}/upload`, authMiddleware, UploadMiddleware(), requestValidator(UPLOAD_DOCUMENT), (req, res) => {
            return this.uploadSignSpecimen(req, res)
        })
    }
}

