import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { File } from "../entity/model/file";

export class FileRepository extends BaseRepository<Prisma.FileDelegate, File> {
    public constructor(client: PrismaClient) {
        super('file', client);
    }
}

export default FileRepository;
