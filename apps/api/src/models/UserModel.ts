import { User } from '@prisma/client';
import { prisma } from '../config/database';

export interface IUserModel {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  static async createUser(data: Omit<IUserModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'user'
      }
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  static async updateUser(id: string, data: Partial<Omit<IUserModel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id }
    });
  }

  static async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }
}