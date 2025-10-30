import { Request, Response } from 'express';
import UserRepository from 'src/repository/user_repository';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const user = await userRepository.getUserById(userId); // pakai instance

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};