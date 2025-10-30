import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { Document } from "../entity/model/document";

export class DocumentRepository extends BaseRepository<Prisma.DocumentDelegate, Document> {
    public constructor(client: PrismaClient) {
        super('document', client);
    }
}

export default DocumentRepository;
