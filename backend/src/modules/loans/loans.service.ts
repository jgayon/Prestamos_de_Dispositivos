import { Injectable, NotFoundException } from '@nestjs/common';
import { Loan } from './domain/entities/Loan';
import { LoanFactory } from './domain/factory/LoanFactory';
import { LaptopLoanFactory } from './domain/factory/LaptopLoanFactory';
import { ChargerLoanFactory } from './domain/factory/ChargerLoanFactory';
import { KitLoanFactory } from './domain/factory/KitLoanFactory';
import { LoanRepository } from './infrastructure/prisma/loan.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class LoansService {

  constructor(
    private readonly loanRepository: LoanRepository
  ) {}

  // Simulación base de datos
  private loans: Map<string, Loan> = new Map();

  private getFactory(type: string): LoanFactory {
    switch (type) {
      case 'LAPTOP':
        return new LaptopLoanFactory();
      case 'CHARGER':
        return new ChargerLoanFactory();
      case 'KIT':
        return new KitLoanFactory();
      default:
        throw new Error('Tipo de préstamo no válido');
    }
  }

  async createLoan(type: string): Promise<{ id: string; state: string }> {

  const factory = this.getFactory(type);
  const id = randomUUID();
  const loan = factory.createLoan(id);

  this.loans.set(id, loan);

  await this.loanRepository.createLoan({
    id: id,
    userId: "user-demo",
    bookId: "device-demo",
    type: type,
    status: loan.getState(),
  });

  return {
    id: loan.id,
    state: loan.getState(),
  };
}

  private getLoan(id: string): Loan {
    const loan = this.loans.get(id);

    if (!loan) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    return loan;
  }

  async approveLoan(id: string) {

  const loan = this.getLoan(id);
  loan.approve();

  await this.loanRepository.updateStatus(id, loan.getState());

  return {
    id: loan.id,
    state: loan.getState(),
  };
}

  async deliverLoan(id: string) {

  const loan = this.getLoan(id);
  loan.deliver();

  await this.loanRepository.updateStatus(id, loan.getState());

  return {
    id: loan.id,
    state: loan.getState(),
  };
}

  async returnLoan(id: string) {

  const loan = this.getLoan(id);
  loan.return();

  await this.loanRepository.updateStatus(id, loan.getState());

  return {
    id: loan.id,
    state: loan.getState(),
  };
}

  async expireLoan(id: string) {

  const loan = this.getLoan(id);
  loan.expire();

  await this.loanRepository.updateStatus(id, loan.getState());

  return {
    id: loan.id,
    state: loan.getState(),
  };
}

  listLoans(): { id: string; state: string }[] {
    return Array.from(this.loans.values()).map(loan => ({
      id: loan.id,
      state: loan.getState(),
    }));
  }
}