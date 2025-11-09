import { Request, Response } from "express";
import Controller from "../base/controller";
import { VerificationService } from "../service/verification_service";
import UploadMiddleware from "../middleware/upload_middleware";
import { authMiddleware } from "../middleware/auth_middleware";
import { FileService } from "../service/file_service";
import { requestValidator } from "../middleware/request_middleware";
import { UPLOAD_CARD } from "../entity/validation/verification";


export class VerificationController extends Controller {
    private verificationService: VerificationService;

    constructor(verificationService: VerificationService, fileService: FileService) {
        super('verification')
        this.verificationService = verificationService
    }

    public async verifyUser(req: Request, res: Response): Promise<any> {
        const data = req.files as Express.Multer.File[]
        const context = (req as any).context as { user_id: string }
        await this.verificationService.verifyUser(data, context.user_id)
        res.send({
            success: true,
            message: 'Success verify ktp!'
        })
    }


    protected setRoutes(): void {
        this._routes.post(`/v1/${this.path}/ocr`, authMiddleware, UploadMiddleware(), requestValidator(UPLOAD_CARD), (req, res) => {
            return this.verifyUser(req, res)
        })
    }
}