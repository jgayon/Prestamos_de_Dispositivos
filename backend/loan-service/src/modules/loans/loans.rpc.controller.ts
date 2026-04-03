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
  getLoans() {
    return this.loansService.listLoans();
  }
}