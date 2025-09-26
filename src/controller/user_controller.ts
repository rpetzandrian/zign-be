import { Request, Response } from "express";
import Controller from "../base/controller";
import UserService from "../service/user_service";


export class UserController extends Controller {
    private userService: UserService;
    constructor(userService: UserService) {
        super('/users')
        this.userService = userService
    }

    public async findAllUsers(req: Request, res: Response) {
        const user = await this.userService.findAllUsers(req.body);
        return res.send({
            message: 'success',
            data: user
        })
    }


    protected setRoutes(): void {
        this._routes.get(`${this.path}/`, (req, res) => {
            return this.findAllUsers(req, res)
        })
    }
}