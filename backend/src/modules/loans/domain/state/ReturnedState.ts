import { LoanState } from './LoanState';

export class ReturnedState implements LoanState {
  constructor(private context: any) {}

  request(): void {
    throw new Error('El préstamo ya fue cerrado.');
  }

  approve(): void {
    throw new Error('El préstamo ya fue cerrado.');
  }

  deliver(): void {
    throw new Error('El préstamo ya fue cerrado.');
  }

  return(): void {
    console.log('El préstamo ya fue devuelto.');
  }

  expire(): void {
    throw new Error('Un préstamo devuelto no puede expirar.');
  }

  getName(): string {
    return 'RETURNED';
  }
}