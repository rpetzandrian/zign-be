import { Request, Response } from "express";
import Controller from "../base/controller";
import { AuthService } from "../service/auth_service";


export class AuthController extends Controller {
    private authService: AuthService;
    constructor(authService: AuthService) {
        super('/auth')
        this.authService = authService
    }

    public async registerUser(req: Request, res: Response) {
        await this.authService.registerUser(req.body);
        return res.send({
            message: 'success!',
        });
    }

    protected setRoutes(): void {
        this._routes.post(`${this.path}/register`, (req, res) => {
            return this.registerUser(req, res)
        })
    }
}