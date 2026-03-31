import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LoanRepository {

  private prisma = new PrismaClient();

  async createLoan(data: {
    id: string;
    userId: string;
    deviceId: string;
    type: string;
    status: string;
    startDate: Date;
    endDate: Date;
  }) {
    return this.prisma.loan.create({
      data
    });
  }

  async findLoanById(id: string) {
    return this.prisma.loan.findUnique({
      where: { id }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.loan.update({
      where: { id },
      data: { status }
    });
  }

  async getAllLoans(filters?: { status?: string; startDate?: Date; endDate?: Date }) {
    const where: any = {};
    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }
    }
    return this.prisma.loan.findMany({ where });
  }

  async deleteLoan(id: string) {
    return this.prisma.loan.delete({
      where: { id },
    });
  }

}