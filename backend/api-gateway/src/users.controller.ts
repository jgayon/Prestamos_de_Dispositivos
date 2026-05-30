import { Controller, Post, Get, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

// Demo users
const DEMO_USERS = [
  { id: '1', name: 'Juan Pérez', email: 'juan@ejemplo.com', password: 'password123' },
  { id: '2', name: 'Carlos Mendoza', email: 'carlos.mendoza@empresa.com', password: 'admin' },
  { id: '3', name: 'Ana Ramirez', email: 'ana.ramirez@empresa.com', password: 'user' },
];

@Controller()
export class UsersController {
  constructor(
    @Inject('LOAN_SERVICE') private client: ClientProxy,
  ) {}

  @Post('auth/login')
  login(@Body() data: { email: string; password: string }) {

  const user = DEMO_USERS.find(
    u =>
      u.email === data.email &&
      u.password === data.password,
  );

  if (!user) {
    return {
      success: false,
      message: 'Credenciales incorrectas',
    };
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const token = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
    }),
    ).toString('base64');

    return {
    success: true,
    access_token: token,
    user: safeUser,
    };
  }

  @Post('users')
  create(@Body() data: any) {
    return this.client.send({ cmd: 'create_user' }, data);
  }

  @Get('users')
  findAll() {
    return this.client.send({ cmd: 'get_users' }, {});
  }
}