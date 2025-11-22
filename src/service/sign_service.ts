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
            bucket_name: String(process.env.IMAGE_BUCKET),
            folder: `sign-specimen/${userId}`,
        }
        const [result] = await this.fileService.uploadPublic([file], options);
        const sign = await this.signRepository.create({
            id: generateUuid(),
            file_id: result.id as string,
            user_id: userId,
            preview_url: result.file_url as string,
        })

        return sign
    }

    public async getSignSpecimen(userId: string, page: number = 1, limit: number = 10) {
        const count_total_size = await this.signRepository.count({
            user_id: userId
        });
        // const signs = await this.signRepository.findAll({
        //     user_id: userId,
        // }, { attributes: ['id', 'user_id', 'preview_url', 'created_at'] })
        const signs = await this.signRepository.findAll(
            { user_id : userId },
            {
                attributes : ['id' , 'user_id' , 'preview_url' , 'created_at'],
                page,
                limit
            }
        )
        const count_total = signs.length;
        const count_total_page = Math.ceil(count_total_size / limit);

        return {
            count_total_size,
            count_total_page,
            count_total,
            previous_page: page > 1 ? page - 1 : null,
            next_page: page < count_total_page ? page + 1 : null,
            rows_data: {
                docs: signs
            }
        };
    }
}