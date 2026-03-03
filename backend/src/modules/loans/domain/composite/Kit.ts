import { LoanItem } from './LoanItem';

export class Kit implements LoanItem {
  private items: LoanItem[] = [];

  constructor(
    private id: string,
    private name: string
  ) {}

  add(item: LoanItem): void {
    this.items.push(item);
  }

  remove(item: LoanItem): void {
    this.items = this.items.filter(i => i !== item);
  }

  getId(): string {
    return this.id;
  }

  getStatus(): string {
    return this.isAvailable() ? 'AVAILABLE' : 'UNAVAILABLE';
  }

  isAvailable(): boolean {
    return this.items.every(i => i.isAvailable());
  }

  getItems(): LoanItem[] {
    return this.items;
  }
}