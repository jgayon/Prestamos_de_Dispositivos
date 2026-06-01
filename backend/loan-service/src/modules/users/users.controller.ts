import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/validate')
  async validateCredentials(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.validateCredentials(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return user;
  }

  @Post()
  create(@Body() body: { name: string; email: string; password: string; role?: string }) {
    return this.usersService.createUser(body.name, body.email, body.password, body.role);
  }

  @Get()
  list() {
    return this.usersService.listUsers();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
