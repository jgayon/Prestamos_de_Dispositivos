import { Loan } from '../entities/Loan';

export interface LoanFactory {
  createLoan(id: string): Loan;
}