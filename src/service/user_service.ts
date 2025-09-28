
import { NextFunction, Request, Response } from "express";
import { Service } from "../base/service"
import UserRepository from "../repository/user_repository";


export class UserService extends Service {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        super()
        this.userRepository = userRepository
    }

    public async findAllUsers(data: any) {
        const user = await this.userRepository.findAll();
        return user
    }
}

export default UserService