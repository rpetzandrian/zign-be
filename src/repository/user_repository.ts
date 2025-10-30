import { Prisma, PrismaClient } from "@prisma/client";
import BaseRepository from "../base/repository";
import { User } from "../entity/model/user";

export default class UserRepository extends BaseRepository<Prisma.UserDelegate<any>, User> {
  constructor(client: PrismaClient) {
    super("user", client);
  }

  async getUserById(userId: string) {
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

// class UserRepository extends BaseRepository<Prisma.UserDelegate<any>, User> {
//   constructor(client: PrismaClient) {
//     super("user", client);
//   }

//   async getUserById(userId: string) {
//     return this.model.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         // tambahkan field lain sesuai kebutuhan (misalnya role, avatar, dsb)
//       },
//     });
//   }
// }

// // ✅ Export instance langsung, bukan class-nya
// export default new UserRepository(prisma);