import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MicroservicesConnectService implements OnModuleInit {
  private readonly logger = new Logger(MicroservicesConnectService.name);

  constructor(
    @Inject('LOAN_SERVICE') private readonly loanClient: ClientProxy,
    @Inject('DEVICE_SERVICE') private readonly deviceClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.loanClient.connect();
      this.logger.log('Conectado a Loan Service (TCP/RPC)');
    } catch (err) {
      this.logger.warn(`Loan Service RPC no disponible: ${err?.message || err}`);
    }

    try {
      await this.deviceClient.connect();
      this.logger.log('Conectado a Device Service (TCP/RPC)');
    } catch (err) {
      this.logger.warn(`Device Service RPC no disponible: ${err?.message || err}`);
    }
  }
}
