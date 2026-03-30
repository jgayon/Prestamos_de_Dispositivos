import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {

  constructor(
    @Inject('LOAN_SERVICE') private readonly loanClient: ClientProxy
  ) {}

  @Post('loans')
  async createLoan(@Body() body: any) {
    return await firstValueFrom(
      this.loanClient.send('create_loan', body)
    );
  }
}