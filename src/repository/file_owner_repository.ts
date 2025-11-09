import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { FileOwner } from "../entity/model/file_owner";

export class FileOwnerRepository extends BaseRepository<Prisma.FileOwnerDelegate, FileOwner> {
    public constructor(client: PrismaClient) {
        super('FileOwner', client);
    }
}

export default FileOwnerRepository;
