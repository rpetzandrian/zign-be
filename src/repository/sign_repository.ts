import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { Sign } from "../entity/model/sign";

export class SignRepository extends BaseRepository<Prisma.SignDelegate, Sign> {
    public constructor(client: PrismaClient) {
        super('Sign', client);
    }
}

export default SignRepository;
