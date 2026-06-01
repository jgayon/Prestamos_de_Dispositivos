import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoansService } from './loans.service';

@Controller()
export class LoansRpcController {
  constructor(private readonly loansService: LoansService) {}

  @MessagePattern({ cmd: 'create_loan' })
  createLoan(
  @Payload()
  data: {
    userId: string;
    deviceId: string;
    type: string;
    startDate: string;
    endDate: string;
  },
) {
  console.log('🔥 RPC create_loan OK');
  return this.loansService.createLoan(data);
}

  @MessagePattern({ cmd: 'get_loans' })
  getLoans(@Payload() filters?: { status?: string; startDate?: string; endDate?: string }) {
    // Convert string dates to Date objects
    const convertedFilters = filters ? {
      status: filters.status,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    } : undefined;
    return this.loansService.listLoans(convertedFilters);
  }

  @MessagePattern({ cmd: 'get_loan' })
  getLoan(@Payload() data: { id: string }) {
    return this.loansService.getLoanById(data.id);
  }

  @MessagePattern({ cmd: 'approve_loan' })
  approveLoan(@Payload() data: { id: string }) {
    return this.loansService.approveLoan(data.id);
  }

  @MessagePattern({ cmd: 'deliver_loan' })
  deliverLoan(@Payload() data: { id: string }) {
    return this.loansService.deliverLoan(data.id);
  }

  @MessagePattern({ cmd: 'return_loan' })
  returnLoan(@Payload() data: { id: string }) {
    return this.loansService.returnLoan(data.id);
  }

  @MessagePattern({ cmd: 'expire_loan' })
  expireLoan(@Payload() data: { id: string }) {
    return this.loansService.expireLoan(data.id);
  }
}