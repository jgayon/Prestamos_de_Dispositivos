import { LoanFactory } from './LoanFactory';
import { Loan } from '../entities/Loan';

export class LaptopLoanFactory implements LoanFactory {
  createLoan(id: string): Loan {
    const loan = new Loan(id);
    // aquí agregar reglas específicas del préstamo de laptop
    return loan;
  }
}