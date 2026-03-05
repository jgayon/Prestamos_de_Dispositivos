import { Injectable, NotFoundException } from '@nestjs/common';
import { Loan } from './domain/entities/Loan';
import { LoanFactory } from './domain/factory/LoanFactory';
import { LaptopLoanFactory } from './domain/factory/LaptopLoanFactory';
import { ChargerLoanFactory } from './domain/factory/ChargerLoanFactory';
import { KitLoanFactory } from './domain/factory/KitLoanFactory';
import { randomUUID } from 'crypto';

@Injectable()
export class LoansService {

  // Simulación de base de datos
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

  createLoan(type: string): { id: string; state: string } {
    const factory = this.getFactory(type);
    const id = randomUUID();
    const loan = factory.createLoan(id);

    this.loans.set(id, loan);

    return {
  id: loan.id,
  state: loan.getState(),
};
  }

  getLoan(id: string): Loan {
    const loan = this.loans.get(id);
    if (!loan) {
      throw new NotFoundException('Préstamo no encontrado');
    }
    return loan;
  }

  approveLoan(id: string) {
  const loan = this.getLoan(id);
  loan.approve();
  return {
    id: loan.id,
    state: loan.getState(),
  };
}

  deliverLoan(id: string) {
    const loan = this.getLoan(id);
    loan.deliver();
    return { 
      id: loan.id,
      state: loan.getState(),
    };
  }

  returnLoan(id: string) {
    const loan = this.getLoan(id);
    loan.return();
    return {
      id: loan.id,
      state: loan.getState(),
    };
  }

  expireLoan(id: string) {
    const loan = this.getLoan(id);
    loan.expire();
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