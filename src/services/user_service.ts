
import { Request, Response } from "express";
import { Service } from "../base/service"
import UserRepository from "../repository/user_repository";


export class UserService extends Service {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        super()
        this.userRepository = userRepository
    }

    public async findAllUsers(req: Request, res: Response) {
        const user = await this.userRepository.findAll();
        return res.send({
            message: 'success',
            data: user
        })
    }

    protected setRoutes(): void {
        this._routes.get('/', (req, res) => {
            return this.findAllUsers(req, res)
        })
    }
}

export default UserService