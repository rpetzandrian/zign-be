import { Request, Response } from "express";
import Controller from "../base/controller";
import { VerificationService } from "../service/verification_service";
import UploadMiddleware from "../middleware/upload_middleware";
import { authMiddleware } from "../middleware/auth_middleware";
import { FileService } from "../service/file_service";


export class VerificationController extends Controller {
    private verificationService: VerificationService;
    private fileService: FileService;

    constructor(verificationService: VerificationService, fileService: FileService) {
        super('verification')
        this.verificationService = verificationService
        this.fileService = fileService
    }

    public async verifyUser(req: Request, res: Response) {
        const data = req.files as Express.Multer.File[]
        // const context = (req as any).context as { user_id: string }
        await this.verificationService.verifyUser(data[0], 'test')
        res.status(200).json({ message: "User verified" })
    }

    public async downloadPreview(req: Request, res: Response) {
        const { file_id } = req.params
        const file = await this.fileService.signPdf()
        res.set({}).end(file.buffer, 'binary');
    }

    protected setRoutes(): void {
        this._routes.post(`/v1/${this.path}/ocr`, UploadMiddleware(), (req, res) => {
            return this.verifyUser(req, res)
        })
        this._routes.get(`/v1/${this.path}/preview/:file_id`, (req, res) => {
            return this.downloadPreview(req, res)
        })
    }
}