import { LoanItem } from './LoanItem';

export class Device implements LoanItem {
  constructor(
    private id: string,
    private name: string,
    private status: 'AVAILABLE' | 'LOANED'
  ) {}

  getId(): string {
    return this.id;
  }

  getStatus(): string {
    return this.status;
  }

  isAvailable(): boolean {
    return this.status === 'AVAILABLE';
  }
}