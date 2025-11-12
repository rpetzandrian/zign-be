import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth_middleware"; // tambahan
import Controller from "../base/controller";
import { UserService } from "../service/user_service";

export class UserController extends Controller {
    private userService: UserService;

    constructor(userService: UserService) {
        super('user');
        this.userService = userService;
    }

    // === method asli tetap dipertahankan ===
    public async findAllUsers(req: Request, res: Response) {
        const user = await this.userService.findAllUsers(req.body);
        return res.send({
            message: 'success',
            data: user
        });
    }

    private async getProfile(req: Request, res: Response) {
        const userId = (req as any).context.user_id;
        const user = await this.userService.getProfile(userId);
        return res.send({
            is_success: true,
            message: 'success',
            data: user
        });
    }

    protected setRoutes(): void {
        this._routes.get(`/v1/${this.path}/profile`, authMiddleware, (req, res) => {
            return this.getProfile(req, res);
        });
    }
}

export default UserController;
