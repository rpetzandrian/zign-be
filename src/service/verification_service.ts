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

    public async verifyUser(data: Files[], userId: string) {
        const user = await this.userRepository.findOneOrFail({ id: userId });
        if (user.is_verified) {
            throw new BadRequestError('user already verified', 'USER_ALREADY_VERIFIED');
        }

        const identityCardFile = data.find(file => file.originalname.includes('card_identity'));
        if(!identityCardFile) {
            throw new BadRequestError('identity card file is required', 'IDENTITY_CARD_FILE_REQUIRED');
        }

        const ocrResult = await this.aiProvider.doOcr(identityCardFile);
        const parsedResult = JSON.parse(ocrResult as string);

        const faceFile = data.find(file => file.originalname.includes('face_identity'));
        if(!faceFile) {
            throw new BadRequestError('face file is required', 'FACE_FILE_REQUIRED');
        }

        await this.fileService.uploadPublic([faceFile], {
            bucket_name: String(process.env.FILE_BUCKET),
            folder: user.id as string,
            filename: `${user.id}-${faceFile.originalname}`
        }, user.id as string, 'face-identity');

        await this.userRepository.update({ id: user.id }, {
            is_verified: true,
            card_no: parsedResult.nik,
            name: parsedResult.nama
        });
    }
}