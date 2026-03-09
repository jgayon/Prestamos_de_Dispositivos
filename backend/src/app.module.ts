import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoansModule } from './modules/loans/loans.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';

@Module({
  imports: [LoansModule, UsersModule, DevicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
