import { Service } from "../base/service";
import { Files } from "../entity/constant/file";
import { generateUuid } from "../lib/helpers";
import { FileService } from "./file_service";
import SignRepository from "../repository/sign_repository";
import { Sign } from "../entity/model/sign";


export class SignService extends Service {
    private fileService: FileService;
    private signRepository: SignRepository
    public constructor(fileService: FileService, signRepository: SignRepository) {
        super();
        this.fileService = fileService;
        this.signRepository = signRepository;
    }

    async uploadSignSpecimen(file: Files, userId: string): Promise<Sign> {
        const options = {
            bucket_name: String(process.env.SIGN_BUCKET),
            folder: userId,
        }
        const [result] = await this.fileService.upload([file], options);
        const sign = await this.signRepository.create({
            id: generateUuid(),
            file_id: result.id as string,
            user_id: userId
        })

        return sign
    }
}