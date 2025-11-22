import { Request, Response } from "express";
import Controller from "../base/controller";
import { AuthService } from "../service/auth_service";
import { requestValidator } from "../middleware/request_middleware";
import { LOGIN_SCHEMA, REGISTER_SCHEMA, RESEND_OTP_SCHEMA, VERIFY_OTP_SCHEMA , FORGOT_PASSWORD_SCHEMA, RESET_PASSWORD_SCHEMA} from "../entity/validation/auth";


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
        await this.authService.resendOtpEmail((req as any).body.email);
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

    public async forgotPassword(req: Request, res: Response) {
        const { token } = await this.authService.forgotPassword(req.body.email);
        return res.send({
            status: "success",
            message: "Password reset token has been sent to your email",
            data: {
                token: token
            }
        });
    }

    public async resetPassword(req: Request, res: Response) {
        await this.authService.resetPassword(req.body);
        return res.send({
            status: "success", // Menggunakan status dan message sesuai permintaan Anda
            message: "Password has been reset successfully"
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

        this._routes.post(`/v1/${this.path}/forgot-password`, requestValidator(FORGOT_PASSWORD_SCHEMA), (req, res) => {
            return this.forgotPassword(req, res)
        });

        this._routes.post(`/v1/${this.path}/reset-password`, requestValidator(RESET_PASSWORD_SCHEMA), (req, res) => {
            return this.resetPassword(req, res)
        });
    }
}