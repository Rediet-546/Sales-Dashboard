import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export abstract class BaseRepository<T> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id }
    });
  }

  async findAll(where?: any): Promise<T[]> {
    return this.model.findMany({
      where: where || {}
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id }
    });
    return count > 0;
  }
}