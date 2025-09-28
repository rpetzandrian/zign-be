import UserRepository from "../repository/user_repository";
import { Service } from "../base/service";
import { AiProvider } from "../lib/ai_provider";
import { BadRequestError } from "../base/http_error";


export class VerificationService extends Service {
    private userRepository: UserRepository;
    private aiProvider: AiProvider;

    constructor(userRepository: UserRepository, aiProvider: AiProvider) {
        super()
        this.userRepository = userRepository
        this.aiProvider = aiProvider
    }

    public async verifyUser(data: any, userId: string) {
        const user = await this.userRepository.findOneOrFail({ id: userId });
        if (user.is_verified) {
            throw new BadRequestError('user already verified')
        }

        const ocrResult = await this.aiProvider.doOcr(data);
        const parsedResult = JSON.parse(ocrResult as string);

        await this.userRepository.update({ id: user.id }, {
            is_verified: true,
            card_no: parsedResult.nik,
            name: parsedResult.nama
        })
    }
}