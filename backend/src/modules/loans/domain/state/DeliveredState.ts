import { LoanState } from './LoanState';

export class DeliveredState implements LoanState {
  constructor(private context: any) {}

  request(): void {
    throw new Error('Ya fue entregado.');
  }

  approve(): void {
    throw new Error('Ya fue aprobado.');
  }

  deliver(): void {
    console.log('El préstamo ya fue entregado.');
  }

  return(): void {
    this.context.setState(this.context.states.returned);
  }

  expire(): void {
    this.context.setState(this.context.states.expired);
  }

  getName(): string {
    return 'DELIVERED';
  }
}