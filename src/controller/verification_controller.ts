import { Request, Response } from "express";
import Controller from "../base/controller";
import { VerificationService } from "../service/verification_service";
import UploadMiddleware from "../middleware/upload_middleware";
import { authMiddleware } from "../middleware/auth_middleware";


export class VerificationController extends Controller {
    private verificationService: VerificationService;

    constructor(verificationService: VerificationService) {
        super('verification')
        this.verificationService = verificationService
    }

    public async verifyUser(req: Request, res: Response) {
        const data = req.files as Express.Multer.File[]
        const context = (req as any).context as { user_id: string }
        await this.verificationService.verifyUser(data[0], context.user_id)
        res.status(200).json({ message: "User verified" })
    }

    protected setRoutes(): void {
        this._routes.post(`/v1/${this.path}/ocr`, authMiddleware, UploadMiddleware(), (req, res) => {
            return this.verifyUser(req, res)
        })
    }
}