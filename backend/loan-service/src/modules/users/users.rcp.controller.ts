import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersRpcController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'create_user' })
  createUser(
    @Payload() data: { name: string; email: string; password: string; role?: string },
  ) {
    return this.usersService.createUser(data.name, data.email, data.password, data.role);
  }

  @MessagePattern({ cmd: 'validate_user_credentials' })
  validateCredentials(@Payload() data: { email: string; password: string }) {
    return this.usersService.validateCredentials(data.email, data.password);
  }

  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.usersService.listUsers();
  }

  @MessagePattern({ cmd: 'get_user' })
  getUser(@Payload() data: { id: string }) {
    return this.usersService.getUserById(data.id);
  }

  @MessagePattern({ cmd: 'update_user' })
  updateUser(@Payload() data: { id: string; name?: string; email?: string; role?: string }) {
    const { id, name, email, role } = data;
    return this.usersService.updateUser(id, { name, email, role });
  }

  @MessagePattern({ cmd: 'delete_user' })
  deleteUser(@Payload() data: { id: string }) {
    return this.usersService.deleteUser(data.id);
  }
}
