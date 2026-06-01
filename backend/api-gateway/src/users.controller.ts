import { Controller, Post, Get, Body, Inject, Put, Delete, Param, ValidationPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { LoginDTO, CreateUserDTO } from './dto/create-user.dto';

@Controller()
export class UsersController {
  constructor(
    @Inject('LOAN_SERVICE') private client: ClientProxy,
    private authService: AuthService,
  ) {}

  @Post('auth/login')
  async login(@Body(new ValidationPipe()) loginDto: LoginDTO) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('users')
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDTO) {
    return await firstValueFrom(
      this.client.send({ cmd: 'create_user' }, createUserDto)
    );
  }

  @Get('users')
  async findAll() {
    return await firstValueFrom(
      this.client.send({ cmd: 'get_users' }, {})
    );
  }

  @Get('users/:id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send({ cmd: 'get_user' }, { id })
    );
  }

  @Put('users/:id')
  async update(@Param('id') id: string, @Body() data: any) {
    return await firstValueFrom(
      this.client.send({ cmd: 'update_user' }, { id, ...data })
    );
  }

  @Delete('users/:id')
  async remove(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send({ cmd: 'delete_user' }, { id })
    );
  }
}