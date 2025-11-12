
import { Service } from "../base/service"
import UserRepository from "../repository/user_repository";
import { BadRequestError } from "../base/http_error";


export class UserService extends Service {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        super()
        this.userRepository = userRepository
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new BadRequestError('User not found', 'USER_NOT_FOUND');
        }
        return user;
    }

    public async findAllUsers(data: any) {
        const user = await this.userRepository.findAll();
        return user
    }
}

export default UserService