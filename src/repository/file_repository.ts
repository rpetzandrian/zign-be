import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { File } from "../entity/model/file";

export class FileRepository extends BaseRepository<Prisma.FileDelegate, File> {
    public constructor(client: PrismaClient) {
        super('File', client);
    }
}

export default FileRepository;
