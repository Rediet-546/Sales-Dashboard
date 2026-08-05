import { User } from '@prisma/client';
import { prisma } from '../config/database';

export class UserModel {
  static async createUser(data: any): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'user',
        team: data.team || null,
        department: data.department || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        phone: data.phone || null,
        avatar: data.avatar || null,
      },
    });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async updateUser(id: string, data: any): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.team !== undefined && { team: data.team }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
    });
  }

  static async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  static async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByTeam(team: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { team },
      orderBy: { name: 'asc' },
    });
  }

  static async findByDepartment(department: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { department },
      orderBy: { name: 'asc' },
    });
  }

  static async getActiveUsers(): Promise<User[]> {
    return prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  static async getTeamMembers(userId: string): Promise<User[]> {
    const user = await this.findById(userId);
    if (!user || !user.team) return [];
    return this.findByTeam(user.team);
  }
}