import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppService } from './app.service';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {

  constructor(
    @Inject('LOAN_SERVICE') private readonly loanClient: ClientProxy,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHealth() {
    return { status: 'API Gateway is running', message: this.appService.getHello() };
  }

  @Post('loans')
  async createLoan(@Body() body: any) {
    return await firstValueFrom(
      this.loanClient.send({ cmd: 'create_loan' }, body)
    );
  }
}