import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersRpcController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  createUser(@Payload() data: { name: string; email: string }) {
    return this.usersService.createUser(data.name, data.email);
  }

  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.usersService.listUsers();
  }
}