import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { User } from "../entity/model/user";

export class UserRepository extends BaseRepository<Prisma.UserDelegate, User> {
    public constructor(client: PrismaClient) {
        super('user', client);
    }
}

export default UserRepository;