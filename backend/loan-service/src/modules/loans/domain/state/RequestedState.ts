import { LoanState } from './LoanState';

export class RequestedState implements LoanState {
  constructor(private context: any) {}

  request(): void {
    console.log('El préstamo ya está solicitado.');
  }

  approve(): void {
    this.context.setState(this.context.states.approved);
  }

  deliver(): void {
    throw new Error('No se puede entregar sin aprobación.');
  }

  return(): void {
    throw new Error('No se puede devolver un préstamo no entregado.');
  }

  expire(): void {
    this.context.setState(this.context.states.expired);
  }

  getName(): string {
    return 'REQUESTED';
  }
}