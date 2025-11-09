import UserRepository from "../repository/user_repository";
import { Service } from "../base/service";
import { AiProvider } from "../lib/ai_provider";
import { BadRequestError } from "../base/http_error";
import { Files } from "../entity/constant/file";
import { FileService } from "./file_service";
import FacePlusProvider from "../lib/faceplus_provider";
import FileOwnerRepository from "../repository/file_owner_repository";


export class VerificationService extends Service {
    private userRepository: UserRepository;
    private aiProvider: AiProvider;
    private fileService: FileService;
    private facePlusProvider: FacePlusProvider;
    private fileOwnerRepository: FileOwnerRepository;

    constructor(userRepository: UserRepository, aiProvider: AiProvider, fileService: FileService, facePlusProvider: FacePlusProvider, fileOwnerRepository: FileOwnerRepository) {
        super()
        this.userRepository = userRepository
        this.aiProvider = aiProvider
        this.fileService = fileService
        this.facePlusProvider = facePlusProvider;
        this.fileOwnerRepository = fileOwnerRepository;
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

    public async faceRecognition(file: Files, userId: string) {
        const user = await this.userRepository.findOneOrFail({ id: userId });
        if (user.is_face_recognized) {
            throw new BadRequestError('user already face recognized', 'USER_ALREADY_FACE_RECOGNIZED');
        }

        const faceIdentityOwner = await this.fileOwnerRepository.findOneOrFail({
            type: 'face-identity',
            user_id: userId
        });

        const faceIdentity = await this.fileService.getFile(faceIdentityOwner.file_id);
        const faceToken1 = faceIdentity.Body.toString('base64');
        const faceToken2 = file.buffer.toString('base64');

        const result = await this.facePlusProvider.compareFaces(faceToken1, faceToken2);
        if(result.confidence < Number(process.env.FACE_RECOGNITION_THRESHOLD)) {
            throw new BadRequestError('face not match', 'FACE_NOT_MATCH');
        }

        const profilePicture = await this.fileService.uploadPublic([file], {
            bucket_name: String(process.env.FILE_BUCKET),
            folder: user.id as string,
            filename: `${user.id}-${file.originalname}`
        }, user.id as string, 'profile-picture');

        await this.userRepository.update({ id: user.id }, {
            is_face_recognized: true,
            profile_picture: profilePicture[0].key
        });
    }
}