import { LoanState } from './LoanState';

export class ApprovedState implements LoanState {
  constructor(private context: any) {}

  request(): void {
    throw new Error('El préstamo ya fue solicitado.');
  }

  approve(): void {
    console.log('El préstamo ya está aprobado.');
  }

  deliver(): void {
    this.context.setState(this.context.states.delivered);
  }

  return(): void {
    throw new Error('No se puede devolver sin entrega.');
  }

  expire(): void {
    this.context.setState(this.context.states.expired);
  }

  getName(): string {
    return 'APPROVED';
  }
}