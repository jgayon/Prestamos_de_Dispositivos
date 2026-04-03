import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersRpcController } from './users.rcp.controller';

@Module({
  controllers: [UsersController, UsersRpcController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
