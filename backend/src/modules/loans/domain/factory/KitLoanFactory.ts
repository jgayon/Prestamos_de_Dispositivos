import { LoanFactory } from './LoanFactory';
import { Loan } from '../entities/Loan';

export class KitLoanFactory implements LoanFactory {
  createLoan(id: string): Loan {
    const loan = new Loan(id);
    // reglas específicas del préstamo de kit
    return loan;
  }
}