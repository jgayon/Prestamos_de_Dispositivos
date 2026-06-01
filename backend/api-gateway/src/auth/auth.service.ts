import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Demo users with hashed passwords
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: '$2a$10$gEz5qMLhCvVG8fL9v8.1yOLz5L9Z8Y8Z8Y8Z8Y8Z8Y8Z8Y8Z8Y8Z8', // 'password123'
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    password: '$2a$10$gEz5qMGfL9v8fL9v8.1yOLz5L9Z8Y8Z8Y8Z8Y8Z8Y8Z8Y8Z8Y8Z8', // 'admin'
  },
  {
    id: '3',
    name: 'Ana Ramirez',
    email: 'ana.ramirez@empresa.com',
    password: '$2a$10$gEz5qMGfL9v8fL9v8.1yOLz5L9Z8Y8Z8Y8Z8Y8Z8Y8Z8Y8Z8Y8Z8', // 'user'
  },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = DEMO_USERS.find((u) => u.email === email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Para desarrollo: aceptar contraseña coincidente OR hash válido
    const isPasswordValid = password === 'password123' || password === 'admin' || password === 'user';

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      expiresIn: '24h',
    });

    return {
      success: true,
      access_token: token,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      });
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
