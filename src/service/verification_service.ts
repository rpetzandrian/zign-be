import UserRepository from "../repository/user_repository";
import { Service } from "../base/service";
import { AiProvider } from "../lib/ai_provider";
import { BadRequestError } from "../base/http_error";
import { Files } from "../entity/constant/file";
import { FileService } from "./file_service";


export class VerificationService extends Service {
    private userRepository: UserRepository;
    private aiProvider: AiProvider;
    private fileService: FileService;

    constructor(userRepository: UserRepository, aiProvider: AiProvider, fileService: FileService) {
        super()
        this.userRepository = userRepository
        this.aiProvider = aiProvider
        this.fileService = fileService
    }

    public async verifyUser(data: Files, userId: string) {
        await this.fileService.upload([data], {
            bucket_name: 'zign-assets',
            folder: 'verification'
        });
        // const user = await this.userRepository.findOneOrFail({ id: userId });
        // if (user.is_verified) {
        //     throw new BadRequestError('user already verified')
        // }

        // const ocrResult = await this.aiProvider.doOcr(data);
        // const parsedResult = JSON.parse(ocrResult as string);

        // console.log(parsedResult)

        // await this.userRepository.update({ id: user.id }, {
        //     is_verified: true,
        //     card_no: parsedResult.nik,
        //     name: parsedResult.nama
        // })
    }
}