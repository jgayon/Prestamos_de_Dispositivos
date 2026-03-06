import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LoanRepository {

  private prisma = new PrismaClient();

  async createLoan(data: {
    id: string;
    userId: string;
    bookId: string;
    type: string;
    status: string;
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

  async getAllLoans() {
    return this.prisma.loan.findMany();
  }

}