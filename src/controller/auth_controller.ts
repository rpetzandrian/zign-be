import { Request, Response } from "express";
import Controller from "../base/controller";
import { AuthService } from "../service/auth_service";
import { authMiddleware } from "../middleware/auth_middleware";
import { requestValidator } from "../middleware/request_middleware";
import { LOGIN_SCHEMA, REGISTER_SCHEMA, RESEND_OTP_SCHEMA, VERIFY_OTP_SCHEMA } from "../entity/validation/auth";


export class AuthController extends Controller {
    private authService: AuthService;
    constructor(authService: AuthService) {
        super('auth')
        this.authService = authService
    }

    public async registerUser(req: Request, res: Response) {
        await this.authService.registerUser(req.body);
        return res.send({
            success: true,
            message: "OTP Sent!"
        });
    }

    public async resendOtpEmail(req: Request, res: Response) {
        await this.authService.resendOtpEmail((req as any).context.user_id);
        return res.send({
            success: true,
            message: "OTP Sent!",
        });
    }

    public async loginUser(req: Request, res: Response) {
        await this.authService.login(req.body.email, req.body.password);
        return res.send({
            success: true,
            message: "OTP Sent!"
        });
    }

    public async verifyOTP(req: Request, res: Response) {
        const data =await this.authService.verifyOTP(req.body.otp, req.body.email);
        return res.send({
            success: true,
            message: "Logged in!",
            data
        });
    }

    protected setRoutes(): void {
        this._routes.post(`/v1/${this.path}/register`, requestValidator(REGISTER_SCHEMA), (req, res) => {
            return this.registerUser(req, res)
        });
        
        this._routes.post(`/v1/${this.path}/resend-otp`, requestValidator(RESEND_OTP_SCHEMA), (req, res) => {
            return this.resendOtpEmail(req, res)
        });
        
        this._routes.post(`/v1/${this.path}/login`, requestValidator(LOGIN_SCHEMA), (req, res) => {
            return this.loginUser(req, res)
        });
        
        this._routes.post(`/v1/${this.path}/verify-otp`, requestValidator(VERIFY_OTP_SCHEMA), (req, res) => {
            return this.verifyOTP(req, res)
        });
    }
}