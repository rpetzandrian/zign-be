import { Prisma, PrismaClient } from "@prisma/client";
import { BadRequestError } from "./http_error";


export interface Opts {
    attributes?: string[];
    sort?: string;
    page?: number;
    limit?: number;
}

interface Order {
    [key: string]: Prisma.SortOrder;
}

export class BaseRepository<T, Entity> {
    protected prismaClient: PrismaClient;
    protected model: T;
    protected modelName: string;
    
    public constructor(modelName: string, client: PrismaClient) {
        this.prismaClient = client;
        this.modelName = modelName;
        this.model = (this.prismaClient as any)[this.modelName];
    }

    protected generateAttributes(attr?: string[]): {[n: string]: boolean} | null {
        return attr?.reduce((acc, cur) => ({...acc, [cur]: true}), {}) || null;
    }

    protected generateSort(sort?: string): Order {
        // if there is -, return desc
        if (!sort) {
            return {
                created_at: Prisma.SortOrder.desc,
            };
        }

        if (sort?.startsWith('-')) {
            return {[sort.slice(1)]: Prisma.SortOrder.desc};
        }
        return {[sort as string]: Prisma.SortOrder.asc};
    }

    public async findAll(where?: Partial<Entity>, opts?: Opts): Promise<Entity[]> {
        const datas = await (this.model as any).findMany({
            select: this.generateAttributes(opts?.attributes),
            where,
            orderBy: this.generateSort(opts?.sort),
        });
        return datas as Entity[];
    }

    public async findOne(where: Partial<Entity>, opts?: Opts): Promise<Entity | null> {
        const data = await (this.model as any).findFirst({
            select: this.generateAttributes(opts?.attributes),
            where,
            orderBy: this.generateSort(opts?.sort),
        });

        return data as Entity | null;
    }

    public async findOneOrFail(where: Partial<Entity>, opts?: Opts): Promise<Entity> {
        const data = await (this.model as any).findFirst({
            select: this.generateAttributes(opts?.attributes),
            where,
            orderBy: this.generateSort(opts?.sort),
        });

        if (!data) {
            throw new BadRequestError(`${this.modelName} not found`, `${this.modelName.toUpperCase()}_NOT_FOUND`);
        }
        return data as Entity;
    }

    public async create(data: Partial<Entity>): Promise<Entity> {
        return (this.model as any).create({
            data,
        }) as Entity;
    }

    public async createMany(data: Partial<Entity>[]): Promise<Entity[]> {
        return (this.model as any).createMany({
            data,
            skipDuplicates: true
        }) as Entity[];
    }

    public async update(where: Partial<Entity>, data: Partial<Entity>): Promise<Entity> {
        return (this.model as any).update({
            where,
            data,
        }) as Entity;
    }

    public async delete(where: Partial<Entity>): Promise<Entity> {
        return (this.model as any).delete({
            where,
        }) as Entity;
    }

    public async count(where?: Partial<Entity>): Promise<number> {
        return (this.model as any).count({
            where,
        });
    }
}

export default BaseRepository;