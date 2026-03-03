export interface LoanItem {
  getId(): string;
  getStatus(): string;
  isAvailable(): boolean;
}