export type LoanStatus = 'REQUESTED' | 'APPROVED' | 'DELIVERED' | 'RETURNED' | 'EXPIRED';
export type LoanType = 'LAPTOP' | 'CHARGER' | 'KIT';

export interface Loan {
  id: string;
  userId: string;
  deviceId: string;
  type: LoanType;
  status: LoanStatus;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

export interface CreateLoanDTO {
  userId: string;
  deviceId: string;
  type: LoanType;
  startDate: string;
  endDate: string;
}
