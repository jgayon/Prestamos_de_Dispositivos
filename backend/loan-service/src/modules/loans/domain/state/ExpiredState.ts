import { LoanState } from './LoanState';

export class ExpiredState implements LoanState {
  constructor(private context: any) {}

  request(): void {
    throw new Error('Préstamo vencido.');
  }

  approve(): void {
    throw new Error('Préstamo vencido.');
  }

  deliver(): void {
    throw new Error('Préstamo vencido.');
  }

  return(): void {
    throw new Error('Préstamo vencido.');
  }

  expire(): void {
    console.log('El préstamo ya está vencido.');
  }

  getName(): string {
    return 'EXPIRED';
  }
}