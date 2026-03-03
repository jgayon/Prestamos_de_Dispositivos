export interface LoanState {
  request(): void;
  approve(): void;
  deliver(): void;
  return(): void;
  expire(): void;
  getName(): string;
}