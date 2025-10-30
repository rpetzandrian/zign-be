import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth_middleware"; // tambahan
import Controller from "../base/controller";
import { UserService } from "../service/user_service";

export class UserController extends Controller {
    public _routes: Router;
    private userService: UserService;

    constructor(userService: UserService) {
        super('/users');
        this.userService = userService;
        this._routes = Router();
        this._registerRoutes(); // tambahan untuk integrasi manual seperti versi awal
    }

    // === method asli tetap dipertahankan ===
    public async findAllUsers(req: Request, res: Response) {
        const user = await this.userService.findAllUsers(req.body);
        return res.send({
            message: 'success',
            data: user
        });
    }

    protected setRoutes(): void {
        this._routes.get(`${this.path}/`, (req, res) => {
            return this.findAllUsers(req, res);
        });

        // tambahkan route profile ke dalam sistem routing base controller
        this._routes.get(`${this.path}/profile`, authMiddleware, (req, res) => {
            return this.getProfile(req, res);
        });
    }

    // === method tambahan dari kode atas ===
    private async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id; // dari middleware auth
            const user = await this.userService.getProfile(userId);
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: (error as Error).message
            });
        }
    }

    // tambahan opsional (jika mau gaya sama seperti versi atas)
    private _registerRoutes() {
        this._routes.get('/profile', authMiddleware, this.getProfile.bind(this));
    }
}

export default UserController;
