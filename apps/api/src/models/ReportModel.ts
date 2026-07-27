import { Report } from '@prisma/client';
import { prisma } from '../config/database';

export interface IReportModel {
  id: string;
  name: string;
  description?: string;
  type: string;
  data: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ReportModel {
  static async createReport(data: Omit<IReportModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    return prisma.report.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        data: data.data,
        userId: data.userId
      }
    });
  }

  static async findById(id: string): Promise<Report | null> {
    return prisma.report.findUnique({
      where: { id }
    });
  }

  static async findByUser(userId: string): Promise<Report[]> {
    return prisma.report.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async updateReport(id: string, data: Partial<Omit<IReportModel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Report> {
    return prisma.report.update({
      where: { id },
      data
    });
  }

  static async deleteReport(id: string): Promise<Report> {
    return prisma.report.delete({
      where: { id }
    });
  }
}