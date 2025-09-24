import { Prisma, PrismaClient } from "@prisma/client";

export class BaseRepository<T, Entity> {
    protected prismaClient: PrismaClient;
    protected model: T;
    
    public constructor(modelName: string, client: PrismaClient) {
        this.prismaClient = client;
        this.model = (this.prismaClient as any)[modelName];
    }

    public async findAll(): Promise<Entity[]> {
        const users = await (this.model as any).findMany();
        return users as Entity[];
    }
}

export default BaseRepository;