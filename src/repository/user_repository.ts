import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { User } from "../entity/model/user";

export default class UserRepository extends BaseRepository<Prisma.UserDelegate<any>, User> {
  constructor(client: PrismaClient) {
    super("User", client);
  }

  public async getUserById(userId: string) {
    return this.model.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}